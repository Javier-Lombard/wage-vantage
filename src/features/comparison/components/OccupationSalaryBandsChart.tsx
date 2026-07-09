import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
} from './chartStyles';

interface OccupationSalaryBandsChartProps {
  /** País base primero, luego los extra — 1 a 3 elementos. */
  countries: string[];
}

interface OccupationBandDatum {
  level: string;
  p25: number;
  median: number;
  p75: number;
  userMedian: number;
}

/** Bandas P25-P75 del sector por nivel — progresión monótona mockeada. */
const OCCUPATION_BAND_DATA: OccupationBandDatum[] = [
  { level: 'Entry', p25: 1400, median: 1700, p75: 2000, userMedian: 1750 },
  { level: 'Junior', p25: 1800, median: 2100, p75: 2500, userMedian: 2200 },
  { level: 'Mid-level', p25: 2300, median: 2700, p75: 3200, userMedian: 2900 },
  { level: 'Senior', p25: 2900, median: 3400, p75: 4000, userMedian: 3600 },
  { level: 'Lead', p25: 3600, median: 4200, p75: 5000, userMedian: 4500 },
  { level: 'Principal', p25: 4400, median: 5200, p75: 6200, userMedian: 5300 },
];

interface OccupationBandChartDatum extends OccupationBandDatum {
  /** Area invisible — ancla la banda visible en p25 en vez de en 0 (mismo truco que el boxplot). */
  bandBase: number;
  /** Altura visible de la banda (p75 - p25), el dataKey real del Area apilado. */
  bandHeight: number;
}

function toBandChartDatum(datum: OccupationBandDatum): OccupationBandChartDatum {
  return {
    ...datum,
    bandBase: datum.p25,
    bandHeight: datum.p75 - datum.p25,
  };
}

export function OccupationSalaryBandsChart({ countries }: OccupationSalaryBandsChartProps) {
  const chartData = OCCUPATION_BAND_DATA.map(toBandChartDatum);

  return (
    <div className="flex flex-col gap-1">
      <Text variant="h4">Occupation Salary Bands</Text>
      <Text variant="caption" className="text-muted mb-3">
        Sector-wide band · {countries.join(' & ')}
      </Text>
      <ComposedChart data={chartData} responsive width="100%" height={260} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="level"
          tick={CHART_TICK_STYLE}
          tickLine={false}
          axisLine={CHART_AXIS_LINE_STYLE}
        />
        <YAxis tick={CHART_TICK_STYLE} tickLine={false} axisLine={CHART_AXIS_LINE_STYLE} />
        <Tooltip
          cursor={{ stroke: 'var(--color-border)' }}
          contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
        />
        <Area
          dataKey="bandBase"
          stackId="band"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="bandHeight"
          stackId="band"
          name="P25–P75 band"
          stroke="none"
          fill="var(--color-chart-2)"
          fillOpacity={0.2}
        />
        <Line
          type="monotone"
          dataKey="median"
          name="Sector median"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="userMedian"
          name="Your salary"
          stroke="var(--color-chart-5)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </div>
  );
}
