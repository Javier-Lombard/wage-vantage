import { useSessionStorage } from '@/shared/hooks/useSessionStorage';

import { SALARY_FORM_FIELDS } from '../components/fieldConfig';
import { parseStoredFormValues } from './parseStoredFormValues';

import type { SalaryFormValues } from '../types';

const STEP_STORAGE_KEY = 'salary-comparator:form-step';
const VALUES_STORAGE_KEY = 'salary-comparator:form-values';

function parseStoredStep(stored: unknown): 1 | 2 | 3 | undefined {
  return stored === 1 || stored === 2 || stored === 3 ? stored : undefined;
}

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
 *
 * Ambos se guardan en sessionStorage: son la clave de caché de
 * useWageInsights, así que al volver de otra ruta (o tras un F5) el form
 * reconstruye los mismos args y RTK Query responde desde su caché en vez de
 * dejar la chart vacía. `initialValues` (fast fill desde una template) pisa
 * lo guardado y reinicia en el paso 1, como cuando el estado era solo local.
 */
export function useSalaryFormState(initialValues?: SalaryFormValues) {
  const [step, setStep] = useSessionStorage<1 | 2 | 3>(STEP_STORAGE_KEY, 1, {
    parse: parseStoredStep,
    override: initialValues ? 1 : undefined,
  });
  const [values, setValues] = useSessionStorage<SalaryFormValues>(
    VALUES_STORAGE_KEY,
    {},
    {
      parse: parseStoredFormValues,
      override: initialValues,
    },
  );

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
