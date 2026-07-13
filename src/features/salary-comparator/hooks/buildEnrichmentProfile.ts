import type { SalaryFormValues } from '../types';

/**
 * Mapeo distinto de buildWageFilters: aquél emite solo las 6 columnas
 * filtrables de TABLE_0 (Country aparte, y sin Years Of Experience/Company
 * Size, que no son filterColumn). Este produce el perfil de 8 campos que lee
 * el prompt de la Edge Function enrich-salary-data — claves fijadas por su
 * contrato, no por el esquema de TABLE_0 (de ahí "Years Of Experience" con
 * "Of" en mayúscula). Country no se incluye: viaja aparte en el body.
 */
export function buildEnrichmentProfile(values: SalaryFormValues): Record<string, string> {
  const profile: Record<string, string> = {};

  if (values.gender) profile['Gender'] = values.gender;
  if (values.occupation) profile['Occupation'] = values.occupation;
  if (values.occupationLevel) profile['Occupation Level'] = values.occupationLevel;
  if (values.economicActivity) profile['Economic Activity'] = values.economicActivity;
  if (values.educationLevel) profile['Education Level'] = values.educationLevel;
  if (values.yearsOfExperience) profile['Years Of Experience'] = values.yearsOfExperience;
  if (values.companySize) profile['Company Size'] = values.companySize;

  return profile;
}
