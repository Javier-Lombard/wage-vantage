import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { AuthDialog, AuthPromptDialog, ResetPasswordDialog, useAuth } from '@/features/auth';
import { SaveTemplateDialog } from '@/features/templates';
import { ErrorBoundary } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';
import { toast } from '@/shared/lib/toast';

import { useSalaryFormState } from '../hooks/useSalaryFormState';
import { useWageInsights } from '../hooks/useWageInsights';
import { useWageStats } from '../hooks/useWageStats';

import { CompareCountryModal } from './CompareCountryModal';
import { MainChart } from './MainChart';
import { SalaryForm } from './SalaryForm';

import type { SalaryFormValues } from '../types';

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

  const hasStarted = Boolean(values.country);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-16">
      {/* Columna derecha en desktop / arriba en mobile — order-1 en mobile */}
      <div className="order-1 lg:order-2">
        <ErrorBoundary>
          <MainChart aggregation={aggregation} isLoading={isFetching} hasStarted={hasStarted} />
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

      <CompareCountryModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />

      <AuthPromptDialog
        isOpen={templatePrompt.isOpen}
        onClose={templatePrompt.close}
        variant={templatePromptVariant}
        onLogIn={openAuthDialog}
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
