import { Area, CartesianGrid, ComposedChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  formatEur,
} from './chartStyles';

interface SectorDistributionChartProps {
  /** País base primero, luego los extra — 1 a 3 elementos. Solo se usan los
   * dos primeros (mock de 2 curvas); sin 2º país se repite el 1º. */
  countries: string[];
  userWage?: number;
}

const WAGE_MIN = 500;
const WAGE_MAX = 5000;
const WAGE_STEP = 250;
const COUNTRY_1_PEAK = 2200;
const COUNTRY_2_PEAK = 2600;

function bellCurve(wage: number, peak: number, spread: number): number {
  return Math.exp(-((wage - peak) ** 2) / (2 * spread ** 2));
}

interface SectorDistributionDatum {
  wage: number;
  country1: number;
  country2: number;
}

/** Dos campanas solapadas (densidad relativa, sin unidad) con pico entre 2000-2800€. */
const SECTOR_DISTRIBUTION_DATA: SectorDistributionDatum[] = Array.from(
  { length: (WAGE_MAX - WAGE_MIN) / WAGE_STEP + 1 },
  (_, index) => {
    const wage = WAGE_MIN + index * WAGE_STEP;
    return {
      wage,
      country1: bellCurve(wage, COUNTRY_1_PEAK, 650),
      country2: bellCurve(wage, COUNTRY_2_PEAK, 700),
    };
  },
);

const WAGE_TICKS = [1000, 2000, 3000, 4000, 5000];

export function SectorDistributionChart({ countries, userWage }: SectorDistributionChartProps) {
  const [country1, country2 = country1] = countries;

  return (
    <div className="flex flex-col gap-4">
      <Text variant="h4">Sector Distribution</Text>
      <ComposedChart
        data={SECTOR_DISTRIBUTION_DATA}
        responsive
        width="100%"
        height={260}
        accessibilityLayer
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="wage"
          type="number"
          domain={[WAGE_MIN, WAGE_MAX]}
          ticks={WAGE_TICKS}
          tickFormatter={formatEur}
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
          type="natural"
          dataKey="country1"
          name={country1}
          stroke="var(--color-chart-1-line)"
          fill="var(--color-chart-1)"
          fillOpacity={0.15}
        />
        <Area
          type="natural"
          dataKey="country2"
          name={country2}
          stroke="var(--color-chart-2)"
          fill="var(--color-chart-2)"
          fillOpacity={0.15}
        />
        <ReferenceLine
          x={COUNTRY_1_PEAK}
          stroke="var(--color-chart-1-line)"
          strokeDasharray="4 4"
          label={{
            value: country1,
            position: 'top',
            fill: 'var(--color-chart-1-line)',
            fontSize: 11,
          }}
        />
        <ReferenceLine
          x={COUNTRY_2_PEAK}
          stroke="var(--color-chart-2)"
          strokeDasharray="4 4"
          label={{
            value: country2,
            position: 'top',
            fill: 'var(--color-chart-2)',
            fontSize: 11,
          }}
        />
        {userWage !== undefined && (
          <ReferenceLine
            x={userWage}
            stroke="var(--color-accent-fg)"
            strokeDasharray="4 4"
            label={{ value: 'You', position: 'top', fill: 'var(--color-accent-fg)', fontSize: 11 }}
          />
        )}
      </ComposedChart>
    </div>
  );
}
