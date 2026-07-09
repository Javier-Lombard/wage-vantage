import { Save, Zap } from 'lucide-react';

import { Button, Icon, StepBar } from '@/shared/components/ui';

import { SalaryFormStep } from './SalaryFormStep';

import type { WageFilterColumn } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

const STEP_LABELS = ['Basics', 'Role', 'Background'];

interface SalaryFormProps {
  step: 1 | 2 | 3;
  values: SalaryFormValues;
  onFieldChange: (id: keyof SalaryFormValues, value: string | number) => void;
  /** Avanza de paso 1→2 o 2→3. No se usa en el paso 3 — ahí el botón dispara onSubmit. */
  onNext: () => void;
  onBack: () => void;
  /** Paso 3: "Go to comparison sheet". Separado de onNext porque navega fuera del form, no avanza un paso. */
  onSubmit: () => void;
  canAdvance: boolean;
  fetchedOptions: string[] | undefined;
  isFetchingOptions: boolean;
  /** Which field `fetchedOptions` actually belongs to — see useWageInsights. */
  nextOptionsField: WageFilterColumn | undefined;
  /** Abre el flujo de rellenar el form desde una template guardada. */
  onFastFill: () => void;
  /** Abre el flujo de guardar el form actual como template (solo en el paso 3). */
  onSaveTemplate: () => void;
}

// text-outline-fg: neutro-oscuro en light (primary no contrasta sobre el panel
// claro), primary en dark. Mismo token que outlineButtonClasses.
const TEMPLATE_LINK_CLASSES =
  'inline-flex items-center gap-1.5 text-outline-fg cursor-pointer text-sm font-semibold hover:underline';

export function SalaryForm({
  step,
  values,
  onFieldChange,
  onNext,
  onBack,
  onSubmit,
  canAdvance,
  fetchedOptions,
  isFetchingOptions,
  nextOptionsField,
  onFastFill,
  onSaveTemplate,
}: SalaryFormProps) {
  return (
    <div className="space-y-6">
      <StepBar steps={STEP_LABELS} currentStep={step - 1} />

      <div className="flex justify-end">
        <button type="button" onClick={onFastFill} className={TEMPLATE_LINK_CLASSES}>
          <Icon icon={Zap} size={16} />
          Fast fill with a template
        </button>
      </div>

      <SalaryFormStep
        step={step}
        values={values}
        onChange={onFieldChange}
        fetchedOptions={fetchedOptions}
        isFetchingOptions={isFetchingOptions}
        nextOptionsField={nextOptionsField}
      />

      {step === 3 && (
        <div className="flex justify-end">
          <button type="button" onClick={onSaveTemplate} className={TEMPLATE_LINK_CLASSES}>
            <Icon icon={Save} size={16} />
            Save as a template
          </button>
        </div>
      )}

      <div className="flex justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}

        <Button disabled={!canAdvance} onClick={step < 3 ? onNext : onSubmit}>
          {step < 3 ? 'Next step' : 'Go to comparison sheet'}
        </Button>
      </div>
    </div>
  );
}
