import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import { supabase } from '@/shared/lib/supabaseClient';

import type { WageFilterColumn, WageFilterParams } from './wageApi.types';
import type { WageInsightsResult } from '../types';

interface WageInsightsArgs {
  filters: WageFilterParams;
  /** Column to return distinct values for; omitted past the last cascade step (Education Level). */
  nextOptionsField?: WageFilterColumn;
}

/**
 * Las dos consultas pasan por funciones RPC de Postgres en vez de leer filas
 * crudas: el conteo de filas por pais llega a ~5.800, por encima del tope de
 * 1.000 filas de PostgREST (db-max-rows, global del proyecto). Devolver un
 * unico array agregado desde SQL esquiva ese tope y, de paso, deduplica las
 * opciones y filtra nulls en el servidor en lugar de traer miles de filas al
 * navegador. Ver wage_distinct_options / wage_monthly_wages en las migraciones.
 *
 * baseQuery es fakeBaseQuery(): el fetch real es supabase.rpc() dentro de
 * queryFn, no una peticion HTTP que el baseQuery normal de RTK Query emita.
 */
export const wageApi = createApi({
  reducerPath: 'wageApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getCountryOptions: builder.query<string[], void>({
      async queryFn() {
        const { data, error } = await supabase.rpc('wage_distinct_options', {
          p_filters: {},
          p_field: 'Country',
        });
        if (error) return { error };

        return { data };
      },
    }),

    getWageInsights: builder.query<WageInsightsResult, WageInsightsArgs>({
      async queryFn({ filters, nextOptionsField }) {
        const wages = await supabase.rpc('wage_monthly_wages', { p_filters: filters });
        if (wages.error) return { error: wages.error };

        let options: string[] | undefined;
        if (nextOptionsField) {
          const distinct = await supabase.rpc('wage_distinct_options', {
            p_filters: filters,
            p_field: nextOptionsField,
          });
          if (distinct.error) return { error: distinct.error };
          options = distinct.data;
        }

        return { data: { monthlyWages: wages.data, options } };
      },
    }),
  }),
});

export const { useGetCountryOptionsQuery, useGetWageInsightsQuery } = wageApi;
