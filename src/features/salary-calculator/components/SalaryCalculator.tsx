import { useState } from 'react';

import { AuthDialog, AuthPromptDialog } from '@/features/auth';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';

import { useSalaryFormState } from '../hooks/useSalaryFormState';
import { useWageInsights } from '../hooks/useWageInsights';
import { useWageStats } from '../hooks/useWageStats';

import { CompareCountryModal } from './CompareCountryModal';
import { MainChart } from './MainChart';
import { SalaryForm } from './SalaryForm';

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
  const { step, values, setFieldValue, goNext, goBack, canAdvance } = useSalaryFormState();
  const { data, isFetching, nextOptionsField } = useWageInsights(values);
  const aggregation = useWageStats(data?.monthlyWages);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  // Auth mockeada (siempre guest): ambos triggers de template abren el mismo
  // upsell de login. Al conectar Supabase se ramificará por tier (free/premium).
  const templatePrompt = useDisclosure();
  const authDialog = useDisclosure();

  const openAuthDialog = () => {
    templatePrompt.close();
    authDialog.open();
  };

  const hasStarted = Boolean(values.country);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-16">
      {/* Columna derecha en desktop / arriba en mobile — order-1 en mobile */}
      <div className="order-1 lg:order-2">
        <MainChart aggregation={aggregation} isLoading={isFetching} hasStarted={hasStarted} />
      </div>

      {/* Columna izquierda en desktop / abajo en mobile — order-3 en mobile */}
      <div className="border-border-subtle bg-surface order-3 rounded-2xl border p-6 lg:order-1">
        <SalaryForm
          step={step}
          values={values}
          onFieldChange={setFieldValue}
          onNext={goNext}
          onBack={goBack}
          canAdvance={canAdvance}
          fetchedOptions={data?.options}
          isFetchingOptions={isFetching}
          nextOptionsField={nextOptionsField}
          onFastFill={templatePrompt.open}
          onSaveTemplate={templatePrompt.open}
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
        variant="log-in-to-save"
        onLogIn={openAuthDialog}
      />

      {/*
       * Auth aún mockeada: onSubmit/onForgotPassword son no-ops hasta que se
       * conecte Supabase; este diálogo solo continúa el upsell de templates.
       */}
      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={authDialog.close}
        onSubmit={() => {}}
        onForgotPassword={() => {}}
      />
    </div>
  );
}
