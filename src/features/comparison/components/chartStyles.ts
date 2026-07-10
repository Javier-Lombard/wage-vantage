/**
 * Estilos de eje/grid/tooltip repetidos en los 4 charts de esta carpeta
 * (mismo patrón visual que MainChart.tsx, pero extraído aquí porque en este
 * feature se repite 4 veces — MainChart sigue con su propia copia inline).
 */
export const CHART_TICK_STYLE = { fill: 'var(--color-muted)', fontSize: 12 };
export const CHART_AXIS_LINE_STYLE = { stroke: 'var(--color-border)' };
export const CHART_GRID_STROKE = 'var(--color-border-subtle)';
export const CHART_TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--color-foreground)',
};

/** Un color de la paleta chart-1..6 por país — el país base siempre chart-1.
 * Repetido en 2 charts de esta feature (SalaryDistributionChart, SalaryGrowthChart)
 * antes de esta extracción — mismo criterio que el resto de este archivo. */
export const SERIES_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
] as const;

/** Salario mensual en €, formato único para los charts de esta feature (Intl,
 * separador de miles) — antes divergía entre formatEur y formatEurTick. */
export function formatEur(value: number): string {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}
