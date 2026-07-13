import { useMemo } from 'react';

import { aggregateWages } from './aggregateWages';

import type { WageAggregation } from '../types';

/**
 * Wrapper memoizado de aggregateWages (derivación estadística pura,
 * reutilizada también por el queryFn de wageApi para el fallback de
 * enriquecimiento — ver aggregateWages.ts). Vive en hooks/, no en wageApi's
 * transformResponse ni en el componente que renderiza el chart
 * (architecture.md §4; solid-principles/single-responsibility.md).
 */
export function useWageStats(monthlyWages: number[] | undefined): WageAggregation | null {
  return useMemo(() => aggregateWages(monthlyWages), [monthlyWages]);
}
