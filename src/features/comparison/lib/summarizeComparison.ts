import type { SalaryFormValues } from '@/features/salary-comparator';

/** "Software Engineer · Spain, Germany" / "Spain, Germany" — degrada con lo que haya disponible. */
export function summarizeComparison(values: SalaryFormValues, selectedCountries: string[]): string {
  const countries = selectedCountries.join(', ');
  return values.occupation ? `${values.occupation} · ${countries}` : countries;
}
