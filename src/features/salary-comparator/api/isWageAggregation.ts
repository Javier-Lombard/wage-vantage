import type { WageAggregation } from '../types';

const AGGREGATION_KEYS = ['min', 'q1', 'median', 'q3', 'max'] as const;

/**
 * Type guard compartido por quien recibe una WageAggregation sin tipar: la
 * respuesta de la Edge Function (enrichSalaryData.ts) y lo leído de
 * sessionStorage (enrichmentCache.ts). Exige números finitos porque un NaN
 * serializado por JSON.stringify llega como null y rompería la caja de MainChart.
 */
export function isWageAggregation(value: unknown): value is WageAggregation {
  if (typeof value !== 'object' || value === null) return false;

  const entries: [string, unknown][] = Object.entries(value);
  const record = new Map(entries);

  return AGGREGATION_KEYS.every((key) => {
    const field = record.get(key);
    return typeof field === 'number' && Number.isFinite(field);
  });
}
