import { useState } from 'react';

import { SALARY_FORM_FIELDS } from '../components/fieldConfig';

import type { SalaryFormValues } from '../types';

function isStepComplete(step: 1 | 2 | 3, values: SalaryFormValues): boolean {
  return SALARY_FORM_FIELDS.filter((field) => field.step === step).every((field) => {
    const value = values[field.id];
    return value !== undefined && value !== '' && !Number.isNaN(value);
  });
}

/**
 * Owns the multi-step form's step index and the 9 in-progress values.
 * Lifted out of SalaryForm (rather than local state inside it) so a sibling
 * chart component can read the same `values` via useWageInsights without
 * SalaryForm reaching upward through a render-body callback.
 */
export function useSalaryFormState(initialValues: SalaryFormValues = {}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<SalaryFormValues>(initialValues);

  function setFieldValue(id: keyof SalaryFormValues, value: string | number) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function goNext() {
    setStep((current) => (current < 3 ? ((current + 1) as 1 | 2 | 3) : current));
  }

  function goBack() {
    setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3) : current));
  }

  return {
    step,
    values,
    setFieldValue,
    goNext,
    goBack,
    canAdvance: isStepComplete(step, values),
  };
}
