import { useWageStats } from './useWageStats';

import type { WageInsightsResult, WageAggregation } from '../types';

/**
 * Prefiere data.aggregation (fallback de Gemini ya resuelto por el endpoint)
 * sobre recalcular desde monthlyWages. useWageStats se llama siempre,
 * incondicionalmente — encapsular esto evita que cada consumidor escriba
 * `data?.aggregation ?? useWageStats(...)` con el hook a la derecha de `??`,
 * que solo se ejecutaría condicionalmente y violaría las reglas de hooks.
 */
export function useResolvedAggregation(
  data: WageInsightsResult | undefined,
): WageAggregation | null {
  const derived = useWageStats(data?.monthlyWages);
  return data?.aggregation ?? derived;
}
