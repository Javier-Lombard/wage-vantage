import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  SERIES_COLORS,
} from './chartStyles';

import type { ReactElement } from 'react';

import type { WageAggregation } from '@/features/salary-comparator';

interface ComparisonSeries {
  country: string;
  aggregation: WageAggregation | null;
}

interface SalaryDistributionChartProps {
  /** País base primero, luego los extra — 1 a 3 elementos. Entradas cuyo
   * fetch aún no resolvió (aggregation null) se omiten hasta que llegan. */
  series: ComparisonSeries[];
  /** SalaryFormValues.monthlyWage — dibuja la línea de referencia "You". */
  userWage?: number;
}

interface BoxPlotDatum extends WageAggregation {
  label: string;
  /** Color por datum — permite un fill distinto por país en la misma serie de Bars. */
  color: string;
  /** Bar base invisible — ancla la caja visible en Q1 en vez de en 0. */
  baseOffset: number;
  /** Altura de la caja visible (Q3 - Q1), el dataKey real del Bar. */
  boxHeight: number;
  /** [delta inferior, delta superior] de Q1/Q3 a min/max, el dataKey del ErrorBar. */
  whiskerRange: [number, number];
}

function toBoxPlotDatum(aggregation: WageAggregation, label: string, color: string): BoxPlotDatum {
  return {
    ...aggregation,
    label,
    color,
    baseOffset: aggregation.q1,
    boxHeight: aggregation.q3 - aggregation.q1,
    // ErrorBar sobre un Bar apilado toma como referencia el valor acumulado
    // MÁS ALTO del stack (baseOffset + boxHeight = q3), no q1 — así lo
    // documenta Recharts. El extremo inferior se calcula desde ESE mismo
    // punto (q3 - min), o el bigote queda descuadrado respecto a la caja.
    whiskerRange: [aggregation.q3 - aggregation.min, aggregation.max - aggregation.q3],
  };
}

interface BoxShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  // Opcional porque así lo tipa Recharts' ActiveShape<BarShapeProps> — en la
  // práctica siempre llega, dado que el Bar recibe `data={chartData}`.
  payload?: BoxPlotDatum;
}

/** Caja + línea de mediana — fill por payload.color en vez de fijo, ver boxplot-pattern.md. */
function BoxWithMedian({ x, y, width, height, payload }: BoxShapeProps): ReactElement | null {
  if (!payload) return null;
  const range = payload.q3 - payload.q1;
  const medianRatio = range === 0 ? 0.5 : (payload.median - payload.q1) / range;
  const medianY = y + height * (1 - medianRatio);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={payload.color} rx={2} />
      <line
        x1={x}
        x2={x + width}
        y1={medianY}
        y2={medianY}
        stroke="var(--color-on-primary)"
        strokeWidth={2}
      />
    </g>
  );
}

/**
 * Box-plot con datos reales (min/Q1/mediana/Q3/max por país, derivados por
 * useWageStats vía ComparisonCountryQuery en ComparisonSheet) — ya no mock.
 * Mismo patrón visual que MainChart.tsx: whisker en muted-foreground (no
 * chart-2, que ya es el color del 2º país) y leyenda de chips al pie cuando
 * hay más de un país.
 */
export function SalaryDistributionChart({ series, userWage }: SalaryDistributionChartProps) {
  const chartData = series
    .map(({ country, aggregation }, index) =>
      aggregation
        ? toBoxPlotDatum(aggregation, country, SERIES_COLORS[index % SERIES_COLORS.length])
        : null,
    )
    .filter((datum): datum is BoxPlotDatum => datum !== null);

  return (
    <div className="flex flex-col gap-4">
      <Text variant="h4">Salary Distribution</Text>
      <BarChart data={chartData} responsive width="100%" height={260} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis dataKey="label" tick={false} tickLine={false} axisLine={CHART_AXIS_LINE_STYLE} />
        <YAxis tick={CHART_TICK_STYLE} tickLine={false} axisLine={CHART_AXIS_LINE_STYLE} />
        {/* stroke: 'transparent' anula el borde gris claro (#ccc) que
            Recharts dibuja por defecto en el rect del cursor. */}
        <Tooltip
          cursor={{ fill: 'var(--color-primary-muted)', stroke: 'transparent' }}
          contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
        />
        <Bar dataKey="baseOffset" stackId="box" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="boxHeight" stackId="box" shape={BoxWithMedian}>
          <ErrorBar
            dataKey="whiskerRange"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
          />
        </Bar>
        {userWage !== undefined && (
          <ReferenceLine
            y={userWage}
            stroke="var(--color-error)"
            strokeWidth={1}
            strokeDasharray="4 4"
            label={{
              value: 'Your monthly wage',
              position: 'insideTopRight',
              fill: 'var(--color-error)',
              fontSize: 11,
            }}
          />
        )}
      </BarChart>

      {chartData.length > 1 && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((datum, index) => (
            <li key={datum.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                // País base (chart-1): el punto usa chart-1-line, legible en
                // light — el relleno de caja sigue en chart-1 sin cambios.
                style={{ backgroundColor: index === 0 ? 'var(--color-chart-1-line)' : datum.color }}
                aria-hidden="true"
              />
              <Text variant="caption" className="text-muted">
                {datum.label}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
