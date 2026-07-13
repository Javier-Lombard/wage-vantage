import { useGetWageInsightsQuery } from '../api/wageApi';
import { SALARY_FORM_FIELDS } from '../components/fieldConfig';
import { buildEnrichmentProfile } from './buildEnrichmentProfile';
import { buildWageFilters } from './buildWageFilters';

import type { SalaryFormValues } from '../types';

/**
 * Halla el índice del último campo filtrable con valor, y a partir de ahí el
 * siguiente campo combobox-fetched-options — ese es el que debe recibir las
 * opciones de esta fetch. Los filtros en sí los arma buildWageFilters
 * (compartido con useCountryComparison); esto solo añade la noción de
 * cascada, propia del form principal.
 */
function findNextOptionsField(values: SalaryFormValues) {
  let lastFilledIndex = -1;

  SALARY_FORM_FIELDS.forEach((field, index) => {
    if (field.kind !== 'combobox-fetched-options' && field.kind !== 'combobox-static-but-filters') {
      return;
    }
    const value = values[field.id];
    if (typeof value !== 'string' || value === '') return;

    lastFilledIndex = index;
  });

  if (lastFilledIndex === -1) return undefined;

  return SALARY_FORM_FIELDS.slice(lastFilledIndex + 1).find(
    (field) => field.kind === 'combobox-fetched-options',
  )?.filterColumn;
}

function buildCascadeQuery(values: SalaryFormValues) {
  const filters = buildWageFilters(values);
  if (Object.keys(filters).length === 0) return null;

  return {
    filters,
    nextOptionsField: findNextOptionsField(values),
    enrichmentProfile: buildEnrichmentProfile(values),
  };
}

/**
 * Live cascade query — re-derives the accumulated filters from `values` on
 * every render and refetches via RTK Query's own caching whenever they
 * change. Skipped entirely until at least one filterable field is chosen
 * (Country), per the brief: nothing fetches before that.
 *
 * Returns `nextOptionsField` alongside the query result so callers can tell
 * which field `data.options` actually belongs to — every
 * combobox-fetched-options field in the same step shares this one query, but
 * only the field whose filterColumn matches `nextOptionsField` is the live
 * target; an already-answered sibling must not render these options as its
 * own (see SalaryFormField).
 */
export function useWageInsights(values: SalaryFormValues) {
  const cascadeQuery = buildCascadeQuery(values);

  const query = useGetWageInsightsQuery(cascadeQuery ?? { filters: {} }, {
    skip: cascadeQuery === null,
  });

  return { ...query, nextOptionsField: cascadeQuery?.nextOptionsField };
}
