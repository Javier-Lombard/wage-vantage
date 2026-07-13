import { useEffect } from 'react';

import { useGetWageInsightsQuery } from '../api/wageApi';
import { useResolvedAggregation } from '../hooks/useResolvedAggregation';

import type { WageFilterParams } from '../api/wageApi.types';
import type { WageAggregation } from '../types';

interface ComparisonCountryQueryProps {
  country: string;
  baseFilters: WageFilterParams;
  /** Perfil de 8 campos para el fallback de Gemini si la muestra de este país es pequeña — ver buildEnrichmentProfile. */
  enrichmentProfile: Record<string, string>;
  onResult: (country: string, aggregation: WageAggregation | null) => void;
}

/**
 * Un componente por país en vez de un hook llamado en bucle: RTK Query
 * expone sus datos vía hooks, y las reglas de hooks de React prohíben
 * llamarlos un número variable de veces (uno por país extra). Montar uno de
 * estos por país dispara su fetch en paralelo al del form principal —
 * mismos filtros salvo Country — y RTK Query cachea cada uno por sus args.
 *
 * Deriva su propia agregación con useWageStats (igual que el país base en
 * SalaryCalculator) y la eleva al padre vía onResult, que la acumula en un
 * Map para MainChart. onResult(country, null) en el cleanup limpia la
 * entrada del Map cuando el país se quita de la comparación o el componente
 * se desmonta por cualquier motivo.
 */
export function ComparisonCountryQuery({
  country,
  baseFilters,
  enrichmentProfile,
  onResult,
}: ComparisonCountryQueryProps) {
  const { data } = useGetWageInsightsQuery({
    filters: { ...baseFilters, Country: country },
    enrichmentProfile,
  });
  const aggregation = useResolvedAggregation(data);

  // Notifica el resultado en cada cambio (sin cleanup aquí: un cleanup atado
  // a `aggregation` dispararía onResult(country, null) en cada recálculo, no
  // solo al desmontar). La limpieza real va en un efecto aparte, atado solo
  // a `country`, que solo corre su cleanup cuando el componente se desmonta
  // de verdad (país quitado de la comparación).
  useEffect(() => {
    onResult(country, aggregation);
  }, [country, aggregation, onResult]);

  useEffect(() => {
    return () => onResult(country, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr en mount/unmount, no en cada cambio de onResult/country
  }, []);

  return null;
}
