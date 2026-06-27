import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Text } from '@/shared/components/ui';

import type { ReactElement } from 'react';

import type { WageAggregation } from '../types';

interface MainChartProps {
  aggregation: WageAggregation | null;
  isLoading: boolean;
}

/**
 * Recharts no trae un BoxPlot nativo: la caja Q1–Q3 se dibuja con un Bar
 * apilado sobre un Bar base invisible (que lo "levanta" de 0 a Q1), los
 * bigotes min/max con ErrorBar y la mediana con un shape custom encima de la
 * caja. Patrón documentado en .claude/skills/recharts/references/boxplot-pattern.md.
 */
interface BoxPlotDatum {
  label: string;
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

function toBoxPlotDatum(aggregation: WageAggregation): BoxPlotDatum {
  return {
    label: 'Your selection',
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
 * mediana a la altura correcta dentro de la caja.
 */
function BoxWithMedian({ x, y, width, height, payload }: BoxShapeProps): ReactElement {
  const range = payload.q3 - payload.q1;
  const medianRatio = range === 0 ? 0.5 : (payload.median - payload.q1) / range;
  const medianY = y + height * (1 - medianRatio);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="var(--color-chart-1)" rx={2} />
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
 * Placeholder del box-plot principal: representa la distribución salarial
 * (min/Q1/mediana/Q3/max) del conjunto filtrado que devuelve Supabase. De
 * momento dibuja un único grupo; la comparación multi-país es una fase
 * posterior. Componente puramente presentacional — recibe la agregación ya
 * calculada por useWageStats, nunca consulta ni deriva (architecture.md §4).
 */
export function MainChart({ aggregation, isLoading }: MainChartProps) {
  if (isLoading) {
    return (
      <div
        className="bg-surface h-80 w-full animate-pulse rounded-xl"
        aria-label="Loading wage comparison"
      />
    );
  }

  if (!aggregation) {
    return (
      <div className="border-border-subtle bg-surface flex h-80 w-full items-center justify-center rounded-xl border p-6 text-center">
        <Text variant="body-sm" className="text-muted">
          Fill in the form to see how your salary compares.
        </Text>
      </div>
    );
  }

  const chartData = [toBoxPlotDatum(aggregation)];

  return (
    <figure className="border-border-subtle bg-surface rounded-xl border p-6">
      <figcaption className="sr-only">
        Salary distribution box plot showing the minimum, first quartile, median, third quartile and
        maximum monthly wage for the current selection.
      </figcaption>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
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
            <ErrorBar dataKey="whiskerRange" stroke="var(--color-chart-2)" strokeWidth={1.5} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
