import { useMemo } from 'react';

import type { WageAggregation } from '../types';

/** Linear-interpolation percentile (matches Excel/numpy's default method). */
function percentile(sorted: number[], p: number): number {
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Derives min/Q1/median/Q3/max from the matched-rows wage array returned by
 * useWageInsights. Statistical derivation lives here, not in wageApi's
 * transformResponse and not in the component that renders the chart
 * (architecture.md §4; solid-principles/single-responsibility.md).
 */
export function useWageStats(monthlyWages: number[] | undefined): WageAggregation | null {
  return useMemo(() => {
    if (!monthlyWages || monthlyWages.length === 0) return null;

    const sorted = [...monthlyWages].sort((a, b) => a - b);
    return {
      min: sorted[0],
      q1: percentile(sorted, 0.25),
      median: percentile(sorted, 0.5),
      q3: percentile(sorted, 0.75),
      max: sorted[sorted.length - 1],
    };
  }, [monthlyWages]);
}
