import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { AuthDialog, AuthPromptDialog, ResetPasswordDialog, useAuth } from '@/features/auth';
import { UpgradeDialog } from '@/features/premium';
import { SaveTemplateDialog } from '@/features/templates';
import { ErrorBoundary } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';
import { toast } from '@/shared/lib/toast';

import { buildWageFilters } from '../hooks/buildWageFilters';
import { useCountryComparison } from '../hooks/useCountryComparison';
import { useSalaryFormState } from '../hooks/useSalaryFormState';
import { useWageInsights } from '../hooks/useWageInsights';
import { useWageStats } from '../hooks/useWageStats';

import { CompareCountryModal } from './CompareCountryModal';
import { ComparisonCountryQuery } from './ComparisonCountryQuery';
import { MainChart } from './MainChart';
import { SalaryForm } from './SalaryForm';

import type { SalaryFormValues, WageAggregation } from '../types';

/**
 * Contenedor de la feature: cablea los tres hooks (estado del formulario,
 * cascada de filtros y derivación estadística) y reparte sus salidas a
 * SalaryForm y MainChart. Mantiene la lógica de negocio fuera de la página,
 * que queda como ensamblador fino (architecture.md §pages).
 *
 * Es también dueño del layout responsive del widget: en móvil la chart va
 * arriba y el formulario debajo; en desktop el formulario a la izquierda y la
 * chart a la derecha. El orden del DOM sigue el de lectura móvil y se reordena
 * en desktop con `lg:order-*` para no duplicar markup.
 */
export function SalaryCalculator() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    user,
    signInWithPassword,
    signUp,
    signInWithOAuth,
    resetPasswordForEmail,
    updateProfile,
  } = useAuth();
  // Prefill desde MyTemplates.onLoad (navigate('/', { state: { fastFillValues } })).
  const initialValues = (location.state as { fastFillValues?: SalaryFormValues } | null)
    ?.fastFillValues;
  const { step, values, setFieldValue, goNext, goBack, canAdvance } =
    useSalaryFormState(initialValues);
  const { data, isFetching, nextOptionsField } = useWageInsights(values);
  const aggregation = useWageStats(data?.monthlyWages);
  const { extraCountries, addCountry, removeCountry, canAddMore, gateOnLimit } =
    useCountryComparison();
  // Agregaciones de los países extra, elevadas por cada ComparisonCountryQuery
  // vía onResult. El país base no vive aquí — su aggregation ya la calcula
  // useWageStats arriba; se combinan solo al armar `series` para MainChart.
  const [comparisonAggregations, setComparisonAggregations] = useState<
    Map<string, WageAggregation>
  >(new Map());
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  // fast-fill y save-template comparten el mismo disclosure pero muestran
  // copy distinto (cargar vs guardar una template) — de ahí el variant en
  // estado en vez de fijo.
  const [templatePromptVariant, setTemplatePromptVariant] = useState<
    'log-in-to-load-template' | 'log-in-to-save-template'
  >('log-in-to-load-template');
  const templatePrompt = useDisclosure();
  const authDialog = useDisclosure();
  const resetPasswordDialog = useDisclosure();
  const saveTemplateDialog = useDisclosure();
  const comparePrompt = useDisclosure();
  const compareUpgrade = useDisclosure();

  const openFastFillPrompt = () => {
    if (isAuthenticated) {
      void navigate('/dashboard/templates');
      return;
    }
    setTemplatePromptVariant('log-in-to-load-template');
    templatePrompt.open();
  };

  const openSaveTemplatePrompt = () => {
    if (isAuthenticated) {
      saveTemplateDialog.open();
      return;
    }
    setTemplatePromptVariant('log-in-to-save-template');
    templatePrompt.open();
  };

  const handleSaveTemplate = async (name: string) => {
    if (!user) return;
    try {
      const newTemplate = { id: crypto.randomUUID(), name, values };
      await updateProfile({ templates: [...(user.metadata.templates ?? []), newTemplate] });
      toast.success('Template saved');
      saveTemplateDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save template.');
    }
  };

  const openAuthDialog = () => {
    templatePrompt.close();
    authDialog.open();
  };

  const openForgotPassword = () => {
    authDialog.close();
    resetPasswordDialog.open();
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPasswordForEmail(email);
      toast.success('Check your email for a reset link');
      resetPasswordDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset link.');
    }
  };

  const handleSubmit = () => {
    void navigate('/comparison', { state: { values } });
  };

  // Memoizado: es dependencia del useEffect de notificación en cada
  // ComparisonCountryQuery — una referencia inestable lo re-dispararía en
  // cada render de SalaryCalculator sin que el dato realmente cambiara.
  const handleComparisonResult = useCallback(
    (country: string, aggregation: WageAggregation | null) => {
      setComparisonAggregations((prev) => {
        const next = new Map(prev);
        if (aggregation) next.set(country, aggregation);
        else next.delete(country);
        return next;
      });
    },
    [],
  );

  const handleAddCountry = (country: string) => {
    const gate = addCountry(country);
    if (gate === 'login') comparePrompt.open();
    else if (gate === 'upgrade') compareUpgrade.open();
    // 'none' = se añadió sin bloqueo — cerramos para que el usuario vea el
    // resultado en MainChart en vez de quedarse en el modal esperando a que
    // elija otro país (solo tiene sentido seguir eligiendo si es premium y
    // aún le cabe un país más, lo cual vuelve a abrirse desde el botón).
    else setIsCompareOpen(false);
  };

  const hasStarted = Boolean(values.country);
  // Mismos filtros del form para las queries de comparación en paralelo —
  // cada ComparisonCountryQuery sobrescribe Country con el país que le toca.
  const baseFilters = buildWageFilters(values);
  // País base primero, luego los extra en el orden en que se añadieron —
  // MainChart asigna el color de cada caja por este mismo orden de índice.
  const series = [
    ...(values.country ? [{ country: values.country, aggregation }] : []),
    ...extraCountries.map((country) => ({
      country,
      aggregation: comparisonAggregations.get(country) ?? null,
    })),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-16">
      {/* Columna derecha en desktop / arriba en mobile — order-1 en mobile */}
      <div className="order-1 lg:order-2">
        <ErrorBoundary>
          <MainChart series={series} isLoading={isFetching} hasStarted={hasStarted} />
        </ErrorBoundary>
      </div>

      {/* Columna izquierda en desktop / abajo en mobile — order-3 en mobile */}
      <div className="border-border-subtle bg-surface order-3 rounded-2xl border p-6 lg:order-1">
        <SalaryForm
          step={step}
          values={values}
          onFieldChange={setFieldValue}
          onNext={goNext}
          onBack={goBack}
          onSubmit={handleSubmit}
          canAdvance={canAdvance}
          fetchedOptions={data?.options}
          isFetchingOptions={isFetching}
          nextOptionsField={nextOptionsField}
          onFastFill={openFastFillPrompt}
          onSaveTemplate={openSaveTemplatePrompt}
        />
      </div>

      {/*
       * Fila del botón: en desktop ocupa la columna derecha (col-start-2),
       * justificado al final; en mobile se intercala entre chart y form (order-2).
       */}
      <div className="flex justify-center order-2 lg:order-3 lg:col-start-2 lg:self-start">
        <button
          type="button"
          disabled={!hasStarted}
          onClick={() => setIsCompareOpen(true)}
          className={outlineButtonClasses(!hasStarted)}
        >
          Compare with another country
        </button>
      </div>

      {extraCountries.map((country) => (
        <ComparisonCountryQuery
          key={country}
          country={country}
          baseFilters={baseFilters}
          onResult={handleComparisonResult}
        />
      ))}

      <CompareCountryModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        baseCountry={values.country}
        extraCountries={extraCountries}
        onAddCountry={handleAddCountry}
        onRemoveCountry={removeCountry}
        isAtHardLimit={!canAddMore && gateOnLimit === 'none'}
      />

      <AuthPromptDialog
        isOpen={templatePrompt.isOpen}
        onClose={templatePrompt.close}
        variant={templatePromptVariant}
        onLogIn={openAuthDialog}
      />

      <AuthPromptDialog
        isOpen={comparePrompt.isOpen}
        onClose={comparePrompt.close}
        variant="sign-in-to-compare"
        onLogIn={() => {
          comparePrompt.close();
          authDialog.open();
        }}
      />

      <UpgradeDialog
        isOpen={compareUpgrade.isOpen}
        onClose={compareUpgrade.close}
        onUpgrade={compareUpgrade.close}
        title="Upgrade to compare more countries"
        showFeatureList
      />

      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={authDialog.close}
        onSubmit={({ email, password }, mode) =>
          mode === 'login' ? signInWithPassword({ email, password }) : signUp({ email, password })
        }
        onForgotPassword={openForgotPassword}
        onOAuth={(provider) => signInWithOAuth(provider)}
      />

      <ResetPasswordDialog
        isOpen={resetPasswordDialog.isOpen}
        onClose={resetPasswordDialog.close}
        onSubmit={(email) => void handleResetPassword(email)}
      />

      <SaveTemplateDialog
        isOpen={saveTemplateDialog.isOpen}
        onClose={saveTemplateDialog.close}
        onSave={(name) => void handleSaveTemplate(name)}
      />
    </div>
  );
}
