import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import { supabase } from '@/shared/lib/supabaseClient';

import { aggregateWages, plausibleWages } from '../hooks/aggregateWages';
import { mergeAggregations } from '../hooks/mergeAggregations';
import { invokeEnrichSalaryData } from './enrichSalaryData';

import type { WageFilterColumn, WageFilterParams } from './wageApi.types';
import type { WageInsightsResult } from '../types';

/**
 * Por debajo de este número de salarios plausibles (tras descartar outliers,
 * ver aggregateWages.ts), la muestra de TABLE_0 es demasiado pequeña para ser
 * estadísticamente significativa y se dispara el fallback de enriquecimiento
 * con Gemini (Edge Function enrich-salary-data).
 */
const MIN_SAMPLE_SIZE = 8;

interface WageInsightsArgs {
  filters: WageFilterParams;
  /** Column to return distinct values for; omitted past the last cascade step (Education Level). */
  nextOptionsField?: WageFilterColumn;
  /** Perfil de 8 campos para el prompt de enrich-salary-data — ver buildEnrichmentProfile. */
  enrichmentProfile?: Record<string, string>;
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
      async queryFn({ filters, nextOptionsField, enrichmentProfile }) {
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

        // El umbral se mide sobre el conteo YA truncado (aggregateWages.ts):
        // los outliers de TABLE_0 no deben rellenar la muestra ni ocultar
        // que hay pocos datos reales.
        const country = filters.Country;
        const validCount = plausibleWages(wages.data).length;

        if (country && validCount < MIN_SAMPLE_SIZE) {
          let estimate;
          try {
            estimate = await invokeEnrichSalaryData(country, enrichmentProfile ?? {});
          } catch (err) {
            return { error: err instanceof Error ? err : new Error('Enrichment request failed') };
          }

          const real = aggregateWages(wages.data);
          const aggregation = real === null ? estimate : mergeAggregations(real, estimate);

          return { data: { monthlyWages: wages.data, options, aggregation } };
        }

        return { data: { monthlyWages: wages.data, options } };
      },
    }),
  }),
});

export const { useGetCountryOptionsQuery, useGetWageInsightsQuery } = wageApi;
