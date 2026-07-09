import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Text } from '@/shared/components/ui';

import { SalaryCalculatorSkeleton } from './SalaryCalculatorSkeleton';

import type { ReactElement } from 'react';

import type { WageAggregation } from '../types';

interface ComparisonSeries {
  country: string;
  aggregation: WageAggregation | null;
}

interface MainChartProps {
  /** País base primero, luego los países de comparación en el orden en que
   * se añadieron. Cada entrada sin aggregation (fetch aún en curso) se omite
   * de la chart hasta que resuelve. */
  series: ComparisonSeries[];
  isLoading: boolean;
  /**
   * La chart permanece oculta hasta que el usuario elige país por primera vez.
   * Mientras `false`, se muestra solo el subtítulo invitando a empezar.
   */
  hasStarted: boolean;
  /** SalaryFormValues.monthlyWage — dibuja la línea de referencia "You" si
   * el usuario ya lo introdujo (paso 1 del form, opcional). */
  userWage?: number;
}

/** Un color de la paleta chart-1..6 por país, en el mismo orden que `series`
 * — el país base siempre chart-1 (el acento verde, su color histórico),
 * igual que SalaryDistributionChart.tsx en el feature comparison. */
const SERIES_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
] as const;

/**
 * Recharts no trae un BoxPlot nativo: la caja Q1–Q3 se dibuja con un Bar
 * apilado sobre un Bar base invisible (que lo "levanta" de 0 a Q1), los
 * bigotes min/max con ErrorBar y la mediana con un shape custom encima de la
 * caja. Patrón documentado en .agents/skills/recharts/references/boxplot-pattern.md.
 */
interface BoxPlotDatum {
  label: string;
  /** Color por datum — permite un fill distinto por país en la misma serie
   * de Bars, ver BoxWithMedian. */
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

function toBoxPlotDatum(aggregation: WageAggregation, label: string, color: string): BoxPlotDatum {
  return {
    label,
    color,
    ...aggregation,
    baseOffset: aggregation.q1,
    boxHeight: aggregation.q3 - aggregation.q1,
    whiskerRange: [aggregation.q1 - aggregation.min, aggregation.max - aggregation.q3],
  };
}

interface BoxShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: BoxPlotDatum;
}

/**
 * Caja con su línea de mediana. El eje Y de Recharts está invertido en píxeles
 * (valor mayor → `y` menor), por eso `medianRatio` se resta de 1 para situar la
 * mediana a la altura correcta dentro de la caja. El fill viene de
 * `payload.color` (no fijo) para poder distinguir varios países en la misma
 * chart.
 */
function BoxWithMedian({ x, y, width, height, payload }: BoxShapeProps): ReactElement {
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
 * Box-plot principal: un cuadro por país en `series` (base + comparación),
 * cada uno con su color de SERIES_COLORS. Componente puramente presentacional
 * — recibe las agregaciones ya calculadas por useWageStats, nunca consulta ni
 * deriva (architecture.md §4). El eje X no muestra nombres de país (evita
 * duplicar la leyenda); la identificación color↔país vive solo en la leyenda
 * de chips al pie, que además es la única fuente de esa relación.
 */
export function MainChart({ series, isLoading, hasStarted, userWage }: MainChartProps) {
  // Antes de elegir país: la chart no existe en el DOM, solo el subtítulo guía.
  if (!hasStarted) {
    return (
      <div className="flex h-full min-h-20 w-full items-center justify-center p-6 text-center">
        <Text variant="body-sm" className="text-muted">
          Fill in the form to see how your salary compares.
        </Text>
      </div>
    );
  }

  const baseAggregation = series[0]?.aggregation;
  if (isLoading || !baseAggregation) {
    return <SalaryCalculatorSkeleton />;
  }

  // Los países extra cuyo fetch aún no resolvió (aggregation null) se omiten
  // hasta que llegan — nunca se pasa un datum a medias a Recharts.
  const chartData = series
    .map(({ country, aggregation }, index) =>
      aggregation
        ? toBoxPlotDatum(aggregation, country, SERIES_COLORS[index % SERIES_COLORS.length])
        : null,
    )
    .filter((datum): datum is BoxPlotDatum => datum !== null);

  return (
    <figure className="border-border-subtle bg-surface flex h-full flex-col rounded-xl border p-6">
      <figcaption className="sr-only">
        Salary distribution box plot comparing the minimum, first quartile, median, third quartile
        and maximum monthly wage across the selected countries.
      </figcaption>
      <ResponsiveContainer width="100%" height="100%" minHeight={320}>
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="label"
            tick={false}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickFormatter={(value: number) => value.toLocaleString()}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-primary-muted)' }}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-foreground)',
            }}
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
      </ResponsiveContainer>

      {chartData.length > 1 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((datum) => (
            <li key={datum.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: datum.color }}
                aria-hidden="true"
              />
              <Text variant="caption" className="text-muted">
                {datum.label}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
