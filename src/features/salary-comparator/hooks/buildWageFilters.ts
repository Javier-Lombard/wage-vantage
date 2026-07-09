import { SALARY_FORM_FIELDS } from '../components/fieldConfig';

import type { WageFilterParams } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

/**
 * Vuelca cada campo filtrable y con valor de `values` a su columna Supabase
 * correspondiente. Extraído de useWageInsights (2ª ocurrencia real: lo
 * reutiliza useCountryComparison para armar los filtros base de los países
 * de comparación) — mismo mapeo campo→filtro, sin la parte de cascada
 * (nextOptionsField) que es exclusiva del form principal.
 */
export function buildWageFilters(values: SalaryFormValues): WageFilterParams {
  const filters: WageFilterParams = {};

  SALARY_FORM_FIELDS.forEach((field) => {
    if (field.kind !== 'combobox-fetched-options' && field.kind !== 'combobox-static-but-filters') {
      return;
    }
    const value = values[field.id];
    if (typeof value !== 'string' || value === '') return;

    filters[field.filterColumn] = value;
  });

  return filters;
}
