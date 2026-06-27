import { Button, StepBar } from '@/shared/components/ui';

import { SalaryFormStep } from './SalaryFormStep';

import type { WageFilterColumn } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

const STEP_LABELS = ['Basics', 'Role', 'Background'];

interface SalaryFormProps {
  step: 1 | 2 | 3;
  values: SalaryFormValues;
  onFieldChange: (id: keyof SalaryFormValues, value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
  fetchedOptions: string[] | undefined;
  isFetchingOptions: boolean;
  /** Which field `fetchedOptions` actually belongs to — see useWageInsights. */
  nextOptionsField: WageFilterColumn | undefined;
}

export function SalaryForm({
  step,
  values,
  onFieldChange,
  onNext,
  onBack,
  canAdvance,
  fetchedOptions,
  isFetchingOptions,
  nextOptionsField,
}: SalaryFormProps) {
  return (
    <div className="space-y-6">
      <StepBar steps={STEP_LABELS} currentStep={step - 1} />

      <SalaryFormStep
        step={step}
        values={values}
        onChange={onFieldChange}
        fetchedOptions={fetchedOptions}
        isFetchingOptions={isFetchingOptions}
        nextOptionsField={nextOptionsField}
      />

      <div className="flex justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < 3 && (
          <Button disabled={!canAdvance} onClick={onNext}>
            Next step
          </Button>
        )}
      </div>
    </div>
  );
}
