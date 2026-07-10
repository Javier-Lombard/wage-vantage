import type { WageAggregation } from '../types';

/** Un color de la paleta chart-1..6 por país, en el mismo orden que `series`
 * — el país base siempre chart-1 (el acento verde, su color histórico),
 * igual que SalaryDistributionChart.tsx en el feature comparison. */
export const SERIES_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
] as const;

/** Los salarios de este feature son siempre mensuales en euros — mismo
 * formato que SectorDistributionChart.tsx en el feature comparison. */
export function formatEur(value: number): string {
  return `${value.toLocaleString()} €`;
}

/**
 * Recharts no trae un BoxPlot nativo: la caja Q1–Q3 se dibuja con un Bar
 * apilado sobre un Bar base invisible (que lo "levanta" de 0 a Q1), los
 * bigotes min/max con ErrorBar y la mediana con un shape custom encima de la
 * caja. Patrón documentado en .agents/skills/recharts/references/boxplot-pattern.md.
 */
export interface BoxPlotDatum {
  label: string;
  /** Color por datum — permite un fill distinto por país en la misma serie
   * de Bars, ver BoxWithMedian en MainChart. */
  color: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Bar base invisible — ancla la caja visible en Q1 en vez de en 0. */
  baseOffset: number;
  /** Altura de la caja visible (Q3 - Q1), el dataKey real del Bar. */
  boxHeight: number;
  /** [delta inferior, delta superior] de Q1/Q3 a min/max, el dataKey del ErrorBar. */
  whiskerRange: [number, number];
}

export function toBoxPlotDatum(
  aggregation: WageAggregation,
  label: string,
  color: string,
): BoxPlotDatum {
  return {
    label,
    color,
    ...aggregation,
    baseOffset: aggregation.q1,
    boxHeight: aggregation.q3 - aggregation.q1,
    whiskerRange: [aggregation.q1 - aggregation.min, aggregation.max - aggregation.q3],
  };
}
