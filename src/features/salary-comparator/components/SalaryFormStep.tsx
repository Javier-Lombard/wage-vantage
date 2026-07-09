import { SALARY_FORM_FIELDS } from './fieldConfig';
import { SalaryFormField } from './SalaryFormField';

import type { WageFilterColumn } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

interface SalaryFormStepProps {
  step: 1 | 2 | 3;
  values: SalaryFormValues;
  onChange: (id: keyof SalaryFormValues, value: string | number) => void;
  fetchedOptions: string[] | undefined;
  isFetchingOptions: boolean;
  nextOptionsField: WageFilterColumn | undefined;
}

export function SalaryFormStep({
  step,
  values,
  onChange,
  fetchedOptions,
  isFetchingOptions,
  nextOptionsField,
}: SalaryFormStepProps) {
  const fields = SALARY_FORM_FIELDS.filter((field) => field.step === step);

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <SalaryFormField
          key={field.id}
          field={field}
          values={values}
          onChange={onChange}
          fetchedOptions={fetchedOptions}
          isFetchingOptions={isFetchingOptions}
          nextOptionsField={nextOptionsField}
        />
      ))}
    </div>
  );
}
