import type { Gender, SalaryFormValues } from '../types';

const STRING_FIELDS = [
  'country',
  'occupation',
  'occupationLevel',
  'economicActivity',
  'educationLevel',
  'yearsOfExperience',
  'companySize',
] as const;

function isGender(value: unknown): value is Gender {
  return value === 'Male' || value === 'Female';
}

/**
 * Reconstruye SalaryFormValues campo a campo desde lo guardado en
 * sessionStorage, descartando solo los campos inválidos en vez del objeto
 * entero. El caso real: un Monthly Wage vaciado es NaN (valueAsNumber) y
 * JSON.stringify lo guarda como null — se trata como campo sin rellenar,
 * igual que NaN en isStepComplete, sin perder el resto del form.
 */
export function parseStoredFormValues(stored: unknown): SalaryFormValues | undefined {
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return undefined;

  const entries: [string, unknown][] = Object.entries(stored);
  const record = new Map(entries);
  const values: SalaryFormValues = {};

  for (const field of STRING_FIELDS) {
    const value = record.get(field);
    if (typeof value === 'string' && value !== '') values[field] = value;
  }

  const gender = record.get('gender');
  if (isGender(gender)) values.gender = gender;

  const monthlyWage = record.get('monthlyWage');
  if (typeof monthlyWage === 'number' && Number.isFinite(monthlyWage)) {
    values.monthlyWage = monthlyWage;
  }

  return values;
}
