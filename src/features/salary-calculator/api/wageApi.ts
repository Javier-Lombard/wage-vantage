import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import { supabase } from '@/shared/lib/supabaseClient';

import type { WageFilterColumn, WageFilterParams, WageRow } from './wageApi.types';
import type { WageInsightsResult } from '../types';

const TABLE = 'TABLE_0';

interface WageInsightsArgs {
  filters: WageFilterParams;
  /** Column to return distinct values for; omitted past the last cascade step (Education Level). */
  nextOptionsField?: WageFilterColumn;
}

/**
 * One parametric endpoint, reused at every cascade step (architecture.md §4,
 * "single source of truth" data flow): apply the accumulated filters, return
 * the matched rows' wages (for useWageStats to aggregate) plus the next
 * field's distinct values (for the next Combobox's options).
 *
 * baseQuery is fakeBaseQuery() — the actual fetch is a Supabase client call
 * inside queryFn, not an HTTP request RTK Query's normal baseQuery can issue.
 */
export const wageApi = createApi({
  reducerPath: 'wageApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getCountryOptions: builder.query<string[], void>({
      async queryFn() {
        const { data, error } = await supabase.from(TABLE).select('Country');
        if (error) return { error };

        const countries = [
          ...new Set((data as Pick<WageRow, 'Country'>[]).map((row) => row.Country)),
        ].sort();
        return { data: countries };
      },
    }),

    getWageInsights: builder.query<WageInsightsResult, WageInsightsArgs>({
      async queryFn({ filters, nextOptionsField }) {
        const columns = nextOptionsField ? `Monthly Wage, ${nextOptionsField}` : 'Monthly Wage';

        let query = supabase.from(TABLE).select(columns);
        for (const [column, value] of Object.entries(filters)) {
          query = query.eq(column, value);
        }

        const { data, error } = await query;
        if (error) return { error };

        const rows = data as unknown as Array<Pick<WageRow, 'Monthly Wage'> & Partial<WageRow>>;
        const monthlyWages = rows.map((row) => row['Monthly Wage']);
        const options = nextOptionsField
          ? [...new Set(rows.map((row) => row[nextOptionsField] as string))].sort()
          : undefined;

        return { data: { monthlyWages, options } };
      },
    }),
  }),
});

export const { useGetCountryOptionsQuery, useGetWageInsightsQuery } = wageApi;
