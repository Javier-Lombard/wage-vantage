import type { SalaryFormValues } from '@/features/salary-calculator';

/** "Cooks in Denmark" / "Denmark" / "Template" — degrada con lo que haya disponible. */
export function summarizeTemplate(values: SalaryFormValues): string {
  const { occupation, country } = values;
  if (occupation && country) return `${occupation} in ${country}`;
  return occupation ?? country ?? 'Custom template';
}
