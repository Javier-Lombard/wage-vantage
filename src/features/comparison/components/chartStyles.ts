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
