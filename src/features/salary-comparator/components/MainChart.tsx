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

import { Logo, Text } from '@/shared/components/ui';

import { GeminiEnrichmentLoader } from './GeminiEnrichmentLoader';
import { formatEur, SERIES_COLORS, toBoxPlotDatum } from './toBoxPlotDatum';

import type { TooltipContentProps } from 'recharts';
import type { ReactElement } from 'react';

import type { WageAggregation } from '../types';
import type { BoxPlotDatum } from './toBoxPlotDatum';

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
 * Recharts' default tooltip content lee los dataKeys de los Bar montados
 * (`baseOffset`, `boxHeight`) — artefactos del truco visual del boxplot, sin
 * significado para el usuario. Este content custom ignora esos dataKeys y
 * lee directamente `payload[0].payload` (el BoxPlotDatum completo) para
 * mostrar las tres estadísticas con significado real: mediana, Q1 y Q3.
 * `payload` de Recharts está tipado `any` en su propia librería (genérico
 * sobre cualquier shape de dato); el cast a BoxPlotDatum es seguro aquí
 * porque este tooltip solo se monta sobre el chartData de este componente.
 */
function BoxPlotTooltip({ active, payload }: TooltipContentProps): ReactElement | null {
  if (!active || !payload?.length) return null;

  const datum = payload[0].payload as BoxPlotDatum;

  return (
    <div
      className="rounded-lg border p-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: datum.color }}
          aria-hidden="true"
        />
        <Text variant="label" className="text-foreground">
          {datum.label}
        </Text>
      </div>
      <dl className="grid grid-cols-[auto_auto] gap-x-3 text-sm">
        <Text as="dt" variant="body-sm" className="text-muted">
          Max
        </Text>
        <Text as="dd" variant="body-sm" className="text-foreground text-right">
          {formatEur(datum.max)}
        </Text>
        <Text as="dt" variant="body-sm" className="text-muted">
          Q3
        </Text>
        <Text as="dd" variant="body-sm" className="text-foreground text-right">
          {formatEur(datum.q3)}
        </Text>
        <Text as="dt" variant="body-sm" className="text-muted">
          Median
        </Text>
        <Text as="dd" variant="body-sm" className="text-foreground text-right">
          {formatEur(datum.median)}
        </Text>
        <Text as="dt" variant="body-sm" className="text-muted">
          Q1
        </Text>
        <Text as="dd" variant="body-sm" className="text-foreground text-right">
          {formatEur(datum.q1)}
        </Text>
        <Text as="dt" variant="body-sm" className="text-muted">
          Min
        </Text>
        <Text as="dd" variant="body-sm" className="text-foreground text-right">
          {formatEur(datum.min)}
        </Text>
      </dl>
    </div>
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
      <div className="flex h-full min-h-20 w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Logo size="large" />
        <Text variant="body-sm" className="text-muted">
          Fill in the form to see how your salary compares.
        </Text>
      </div>
    );
  }

  const baseAggregation = series[0]?.aggregation;
  if (isLoading || !baseAggregation) {
    return <GeminiEnrichmentLoader />;
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
    <figure className="border-border-subtle bg-surface flex h-full flex-col rounded-xl border px-2 py-6 md:px-6">
      <figcaption className="sr-only">
        Salary distribution box plot comparing the minimum, first quartile, median, third quartile
        and maximum monthly wage across the selected countries.
      </figcaption>
      <ResponsiveContainer width="100%" height="100%" minHeight={320}>
        <BarChart
          data={chartData}
          accessibilityLayer
          // Con 1 solo país la barra ocuparía toda la categoría del eje X
          // (ver captura del bug): barCategoryGap es el hueco entre
          // categorías como % del ancho de categoría, así que un 25% de
          // hueco dobla como "la barra ocupa el 75% restante". Con 2-3
          // países no se toca — el gap por defecto de Recharts ya separa
          // bien las cajas de comparación.
          barCategoryGap={chartData.length === 1 ? '25%' : undefined}
        >
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
            tickFormatter={formatEur}
          />
          <Tooltip cursor={{ fill: 'var(--color-primary-muted)' }} content={BoxPlotTooltip} />
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
                fontWeight: 700,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      <Text variant="body-sm" className="text-primary mt-3 text-center">
        <span className="md:hidden">Tap chart to see tooltip</span>
        <span className="hidden md:inline">Move cursor over chart to see tooltip</span>
      </Text>
      <Text variant="caption" className="mt-1 text-center">
        Max: highest wage recorded · Q3: 75th percentile · Median: 50th percentile · Q1: 25th
        percentile · Min: lowest wage recorded
      </Text>

      {chartData.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
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
    </figure>
  );
}
