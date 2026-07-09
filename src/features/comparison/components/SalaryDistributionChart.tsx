import { Bar, BarChart, CartesianGrid, ErrorBar, Tooltip, XAxis, YAxis } from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
} from './chartStyles';

import type { ReactElement } from 'react';

import type { WageAggregation } from '@/features/salary-comparator';

interface SalaryDistributionChartProps {
  countries: [string, string];
}

/** Boxplots mockeados — mismo shape que MainChart.tsx, valores realistas. */
const MOCK_AGGREGATIONS: [WageAggregation, WageAggregation] = [
  { min: 1200, q1: 1800, median: 2300, q3: 2900, max: 4200 },
  { min: 2100, q1: 2900, median: 3600, q3: 4400, max: 6800 },
];

const SERIES_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)'] as const;

interface BoxPlotDatum extends WageAggregation {
  label: string;
  /** Color por datum (a diferencia de MainChart) para distinguir los dos países. */
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

/** Caja + línea de mediana — fill por payload.color en vez de fijo, ver boxplot-pattern.md. */
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

export function SalaryDistributionChart({ countries }: SalaryDistributionChartProps) {
  const chartData = MOCK_AGGREGATIONS.map((aggregation, index) =>
    toBoxPlotDatum(aggregation, countries[index], SERIES_COLORS[index]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Text variant="h4">Salary Distribution</Text>
      <BarChart data={chartData} responsive width="100%" height={260} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="label"
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={CHART_AXIS_LINE_STYLE}
        />
        <YAxis tick={CHART_TICK_STYLE} tickLine={false} axisLine={CHART_AXIS_LINE_STYLE} />
        <Tooltip
          cursor={{ fill: 'var(--color-primary-muted)' }}
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
      </BarChart>
    </div>
  );
}
