import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
} from './chartStyles';

interface SalaryGrowthChartProps {
  countries: [string, string];
}

interface GrowthDatum {
  year: string;
  country1: number;
  country2: number;
}

/** Mediana mensual estimada — progresión realista (no lineal), 2015-2024. */
const GROWTH_DATA: GrowthDatum[] = [
  { year: '2015', country1: 1620, country2: 2450 },
  { year: '2016', country1: 1680, country2: 2520 },
  { year: '2017', country1: 1750, country2: 2610 },
  { year: '2018', country1: 1840, country2: 2700 },
  { year: '2019', country1: 1950, country2: 2830 },
  { year: '2020', country1: 1930, country2: 2860 },
  { year: '2021', country1: 2020, country2: 2980 },
  { year: '2022', country1: 2180, country2: 3160 },
  { year: '2023', country1: 2340, country2: 3420 },
  { year: '2024', country1: 2480, country2: 3620 },
];

const formatEur = (value: number) =>
  value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function SalaryGrowthChart({ countries }: SalaryGrowthChartProps) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="h4">Salary Growth — Last 10 Years</Text>
      <Text variant="caption" className="text-muted mb-3">
        Estimated monthly median wage · provisional data
      </Text>
      <BarChart data={GROWTH_DATA} responsive width="100%" height={260} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="year"
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={CHART_AXIS_LINE_STYLE}
        />
        <YAxis
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={CHART_AXIS_LINE_STYLE}
          tickFormatter={formatEur}
          width={72}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-primary-muted)' }}
          contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-muted)' }} />
        <Bar
          dataKey="country1"
          name={countries[0]}
          fill="var(--color-chart-1)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="country2"
          name={countries[1]}
          fill="var(--color-chart-2)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </div>
  );
}
