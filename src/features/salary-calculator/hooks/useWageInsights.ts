import { useGetWageInsightsQuery } from '../api/wageApi';
import { SALARY_FORM_FIELDS } from '../components/fieldConfig';

import type { WageFilterParams } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

/**
 * Builds the accumulated Supabase filters from every filled, filterable
 * field (combobox-fetched-options + combobox-static-but-filters) up to the
 * last one the user has actually chosen a value for, and finds the next
 * combobox-fetched-options field after it — that field is the one whose
 * options this fetch should return. Pure derivation, no fetch — kept inline
 * here since useWageInsights is its only consumer (conventions.md §3).
 */
function buildCascadeQuery(values: SalaryFormValues) {
  const filters: WageFilterParams = {};
  let lastFilledIndex = -1;

  SALARY_FORM_FIELDS.forEach((field, index) => {
    if (field.kind !== 'combobox-fetched-options' && field.kind !== 'combobox-static-but-filters') {
      return;
    }
    const value = values[field.id];
    if (typeof value !== 'string' || value === '') return;

    filters[field.filterColumn] = value;
    lastFilledIndex = index;
  });

  if (lastFilledIndex === -1) return null;

  const nextField = SALARY_FORM_FIELDS.slice(lastFilledIndex + 1).find(
    (field) => field.kind === 'combobox-fetched-options',
  );

  return { filters, nextOptionsField: nextField?.filterColumn };
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
