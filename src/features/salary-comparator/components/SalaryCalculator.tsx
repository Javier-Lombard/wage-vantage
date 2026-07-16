import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { AuthFlowDialogs, AuthPromptDialog, useAuth } from '@/features/auth';
import { UpgradeDialog } from '@/features/premium';
import { SaveTemplateDialog } from '@/features/templates';
import { ErrorBoundary } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useScrollToElement } from '@/shared/hooks/useScrollToElement';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';
import { toast } from '@/shared/lib/toast';

import { buildEnrichmentProfile } from '../hooks/buildEnrichmentProfile';
import { buildWageFilters } from '../hooks/buildWageFilters';
import { useCountryComparison } from '../hooks/useCountryComparison';
import { useResolvedAggregation } from '../hooks/useResolvedAggregation';
import { useSalaryFormState } from '../hooks/useSalaryFormState';
import { useWageInsights } from '../hooks/useWageInsights';

import { CompareCountryModal } from './CompareCountryModal';
import { ComparisonCountryQuery } from './ComparisonCountryQuery';
import { SALARY_FORM_FIELDS } from './fieldConfig';
import { MainChart } from './MainChart';
import { SalaryForm } from './SalaryForm';

import type { SalaryFormValues, WageAggregation } from '../types';

/**
 * Campos cuya selección cambia lo que MainChart muestra (disparan un fetch,
 * ver fieldConfig.ts) — derivado de SALARY_FORM_FIELDS en vez de una lista
 * fija para quedar auto-sincronizado si se añade/quita un campo. Quedan
 * fuera 'combobox-static-no-filter' (Years of Experience, Company Size: no
 * filtran nada del lado servidor) y 'number-input' (Monthly Wage: no es
 * combobox y no dispara fetch).
 */
const SCROLL_TRIGGERING_FIELDS = new Set(
  SALARY_FORM_FIELDS.filter(
    (field) => field.kind !== 'combobox-static-no-filter' && field.kind !== 'number-input',
  ).map((field) => field.id),
);

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
  const { isAuthenticated, user, updateProfile } = useAuth();
  // Prefill desde MyTemplates.onLoad (navigate('/', { state: { fastFillValues } })).
  const initialValues = (location.state as { fastFillValues?: SalaryFormValues } | null)
    ?.fastFillValues;
  const { step, values, setFieldValue, goNext, goBack, canAdvance } =
    useSalaryFormState(initialValues);
  const chartRef = useRef<HTMLDivElement>(null);
  const scrollToChart = useScrollToElement(chartRef);
  const handleFieldChange = (id: keyof SalaryFormValues, value: string | number) => {
    setFieldValue(id, value);
    if (SCROLL_TRIGGERING_FIELDS.has(id)) scrollToChart();
  };
  const { data, isFetching, nextOptionsField } = useWageInsights(values);
  const aggregation = useResolvedAggregation(data);
  const { extraCountries, addCountry, removeCountry, canAddMore, gateOnLimit } =
    useCountryComparison();
  // Agregaciones de los países extra, elevadas por cada ComparisonCountryQuery
  // vía onResult. El país base no vive aquí — su aggregation ya la calcula
  // useWageStats arriba; se combinan solo al armar `series` para MainChart.
  const [comparisonAggregations, setComparisonAggregations] = useState<
    Map<string, WageAggregation>
  >(new Map());
  // País(es) de comparación con una query en vuelo ahora mismo — su unión con
  // isFetching del país base decide si MainChart muestra el loader (ver
  // isLoading más abajo), para que añadir un segundo país también lo dispare.
  const [loadingComparisonCountries, setLoadingComparisonCountries] = useState<Set<string>>(
    new Set(),
  );
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  // fast-fill y save-template comparten el mismo disclosure pero muestran
  // copy distinto (cargar vs guardar una template) — de ahí el variant en
  // estado en vez de fijo.
  const [templatePromptVariant, setTemplatePromptVariant] = useState<
    'log-in-to-load-template' | 'log-in-to-save-template'
  >('log-in-to-load-template');
  const templatePrompt = useDisclosure();
  const authDialog = useDisclosure();
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

  const handleSubmit = () => {
    void navigate('/comparison', { state: { values, extraCountries } });
  };

  // Memoizado: es dependencia del useEffect de notificación en cada
  // ComparisonCountryQuery — una referencia inestable lo re-dispararía en
  // cada render de SalaryCalculator sin que el dato realmente cambiara.
  const handleComparisonResult = useCallback(
    (country: string, aggregation: WageAggregation | null, isLoading: boolean) => {
      setComparisonAggregations((prev) => {
        const next = new Map(prev);
        if (aggregation) next.set(country, aggregation);
        else next.delete(country);
        return next;
      });
      setLoadingComparisonCountries((prev) => {
        const next = new Set(prev);
        if (isLoading) next.add(country);
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
  // Mismo perfil para el fallback de Gemini de cada país de comparación —
  // memoizado porque es dependencia de args de useGetWageInsightsQuery en
  // cada ComparisonCountryQuery (una referencia inestable dispararía un
  // refetch en cada render de SalaryCalculator).
  const enrichmentProfile = useMemo(() => buildEnrichmentProfile(values), [values]);
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
      <div className="order-1 lg:order-2" ref={chartRef}>
        <ErrorBoundary>
          <MainChart
            series={series}
            isLoading={isFetching || loadingComparisonCountries.size > 0}
            hasStarted={hasStarted}
            userWage={values.monthlyWage}
          />
        </ErrorBoundary>
      </div>

      {/* Columna izquierda en desktop / abajo en mobile — order-3 en mobile */}
      <div className="border-border-subtle bg-surface order-3 rounded-2xl border p-6 lg:order-1">
        <SalaryForm
          step={step}
          values={values}
          onFieldChange={handleFieldChange}
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
          enrichmentProfile={enrichmentProfile}
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

      <AuthFlowDialogs isOpen={authDialog.isOpen} onClose={authDialog.close} />

      <SaveTemplateDialog
        isOpen={saveTemplateDialog.isOpen}
        onClose={saveTemplateDialog.close}
        onSave={(name) => void handleSaveTemplate(name)}
      />
    </div>
  );
}
