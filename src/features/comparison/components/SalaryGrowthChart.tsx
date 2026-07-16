import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import { Text } from '@/shared/components/ui';

import {
  CHART_AXIS_LINE_STYLE,
  CHART_GRID_STROKE,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  formatEur,
  SERIES_COLORS,
} from './chartStyles';

interface SalaryGrowthChartProps {
  /** País base primero, luego los extra — 1 a 3 elementos. Una barra por
   * país, mismo orden y color que SalaryDistributionChart/MainChart. */
  countries: string[];
}

const YEARS = [
  '2015',
  '2016',
  '2017',
  '2018',
  '2019',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
] as const;

/**
 * Progresión mensual estimada mockeada — no lineal, con un salario base y una
 * tasa de crecimiento anual distintos por índice de país (no por país en sí:
 * no hay serie temporal real por país en los datos de Supabase, así que el
 * mock solo necesita variar visualmente entre las hasta 3 series posibles).
 */
const BASE_WAGE_BY_INDEX = [1620, 2450, 1950] as const;
const GROWTH_RATE_BY_INDEX = [0.038, 0.042, 0.035] as const;

function buildGrowthValue(index: number, yearIndex: number): number {
  const base = BASE_WAGE_BY_INDEX[index % BASE_WAGE_BY_INDEX.length];
  const rate = GROWTH_RATE_BY_INDEX[index % GROWTH_RATE_BY_INDEX.length];
  // 2020 (yearIndex 5) rompe la curva suave, igual que el mock original
  // (una ligera bajada), para que no se vea como una exponencial perfecta.
  const dip = yearIndex === 5 ? 0.99 : 1;
  return Math.round(base * (1 + rate) ** yearIndex * dip);
}

interface GrowthDatum {
  year: string;
  [countryKey: `country${number}`]: string | number;
}

function buildGrowthData(countryCount: number): GrowthDatum[] {
  return YEARS.map((year, yearIndex) => {
    const datum: GrowthDatum = { year };
    for (let index = 0; index < countryCount; index += 1) {
      datum[`country${index}`] = buildGrowthValue(index, yearIndex);
    }
    return datum;
  });
}

export function SalaryGrowthChart({ countries }: SalaryGrowthChartProps) {
  const growthData = buildGrowthData(countries.length);

  return (
    <div className="flex flex-col gap-1">
      <Text variant="h4">Salary Growth — Last 10 Years</Text>
      <Text variant="caption" className="text-muted mb-3">
        Estimated monthly median wage · provisional data
      </Text>
      <BarChart data={growthData} responsive width="100%" height={260} accessibilityLayer>
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
        {/* stroke: 'transparent' anula el borde gris claro (#ccc) que
            Recharts dibuja por defecto en el rect del cursor. */}
        <Tooltip
          cursor={{ fill: 'var(--color-primary-muted)', stroke: 'transparent' }}
          contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-muted)' }} />
        {countries.map((country, index) => (
          <Bar
            key={country}
            dataKey={`country${index}`}
            name={country}
            // País base (chart-1): la barra es un fill sólido sobre fondo
            // transparente (sin ink encima como en el box-plot), así que usa
            // chart-1-line, legible en light — mismo criterio que el area
            // stroke de SectorDistributionChart.
            fill={index === 0 ? 'var(--color-chart-1-line)' : SERIES_COLORS[index % SERIES_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </div>
  );
}
