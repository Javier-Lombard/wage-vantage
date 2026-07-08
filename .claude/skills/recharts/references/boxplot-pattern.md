# Box Plot Pattern (Bar + ErrorBar)

> **Project addendum**: unlike `api_reference.md`, `best_practices.md`, and `examples.md` in this same `references/` folder — which are unmodified content downloaded from the external `recharts` skill — this file was authored specifically for this project. It uses TypeScript throughout (the rest of this skill's examples are plain JSX) and references this project's actual design tokens instead of the demo hex colors (`#8884d8`, etc.) used elsewhere in this skill. It exists because Recharts has no native `BoxPlot` component, and the external skill content does not cover the workaround.

Recharts does not ship a `BoxPlot` chart type. Recharts' own official example (`recharts.github.io/en-US/examples/BoxPlot/`) builds a box plot by combining `Bar` (for the box) with `ErrorBar` (for the whiskers) and a custom `shape` function (for the median line drawn on top). This file documents that pattern, typed for a salary-comparison use case.

## Table of Contents

1. [Data Shape](#data-shape)
2. [Mapping Data to Bar + ErrorBar](#mapping-data-to-bar--errorbar)
3. [Custom Median Line Shape](#custom-median-line-shape)
4. [Full Component](#full-component)
5. [Colors](#colors)
6. [Loading / Empty State with RTK Query](#loading--empty-state-with-rtk-query)

## Data Shape

Each point on the X axis (a country, a sector, an occupation level) needs five statistics: `min`, `q1`, `median`, `q3`, `max`. Type this explicitly rather than passing around an untyped array of numbers:

```ts
interface WageBoxPlotPoint {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

const data: WageBoxPlotPoint[] = [
  { label: 'Spain', min: 1200, q1: 1800, median: 2300, q3: 2900, max: 4200 },
  { label: 'Germany', min: 2100, q1: 2900, median: 3600, q3: 4400, max: 6800 },
  { label: 'Portugal', min: 950, q1: 1400, median: 1750, q3: 2200, max: 3100 },
];
```

This shape is what a derivation hook (e.g. `useWageStats`) is expected to return per group — the box plot component itself never computes these values, it only renders them.

## Mapping Data to Bar + ErrorBar

Recharts' `Bar` cannot render a "floating" box (it always grounds at 0), so the trick is to render an **invisible base** from `0` to `q1`, then a **visible bar** from `q1` to `q3` (the box itself), using a stacked `Bar` pair. The whiskers (`min`/`max`) are attached via `ErrorBar` on the visible segment.

```tsx
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

interface WageBoxPlotPoint {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

interface BoxPlotDatum extends WageBoxPlotPoint {
  /** Invisible spacer bar — grounds the visible box at q1 instead of 0. */
  baseOffset: number;
  /** Height of the visible box (q3 - q1), the Bar's actual dataKey. */
  boxHeight: number;
  /** [low, high] delta from q1/q3 to min/max, the ErrorBar's dataKey. */
  whiskerRange: [number, number];
}

function toBoxPlotDatum(point: WageBoxPlotPoint): BoxPlotDatum {
  return {
    ...point,
    baseOffset: point.q1,
    boxHeight: point.q3 - point.q1,
    whiskerRange: [point.q1 - point.min, point.max - point.q3],
  };
}
```

## Custom Median Line Shape

The median is not a `Bar` segment — it is a single horizontal line drawn _inside_ the box at the median's Y position. Recharts' `shape` prop on `Bar` accepts a function that receives the bar's computed pixel geometry (`x`, `y`, `width`, `height`) plus the original datum, so the median line is drawn relative to that geometry rather than recalculated from scratch:

```tsx
import type { ReactElement } from 'react';

interface BarShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: BoxPlotDatum;
}

function BoxWithMedian({ x, y, width, height, payload }: BarShapeProps): ReactElement {
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
```

The Y-axis in Recharts is inverted in pixel space (higher value = smaller `y`), which is why `medianRatio` is subtracted from `1` rather than used directly — verify this against the actual rendered chart, since the exact inversion depends on whether the box is rendered top-down or bottom-up for the chosen `BarChart` orientation.

## Full Component

```tsx
function WageBoxPlot({ data }: { data: WageBoxPlotPoint[] }) {
  const chartData = data.map(toBoxPlotDatum);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="baseOffset" stackId="box" fill="transparent" />
        <Bar dataKey="boxHeight" stackId="box" shape={BoxWithMedian}>
          <ErrorBar dataKey="whiskerRange" stroke="var(--color-chart-2)" strokeWidth={1.5} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Colors

Per `docs/DESIGN.md` §1, this project's chart palette is invariant across dark/light mode and exposed as CSS variables via Tailwind v4's `@theme` (`--color-chart-1` through `--color-chart-6`, plus `--color-on-primary`). Use those tokens, not the `#8884d8`-style demo colors used in this skill's other reference files:

| Box plot part      | Token        | Resolved value | Why                                                                                                                                                                   |
| ------------------ | ------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box (Q1–Q3 range)  | `chart-1`    | `#DFFF88`      | Documented in `DESIGN.md` §1 as "Primary data (accent)" — the box is this chart's primary signal.                                                                     |
| Whiskers (min/max) | `chart-2`    | `#60A5FA`      | "Second series (blue)" — visually distinct from the box without competing with it.                                                                                    |
| Median line        | `on-primary` | `#13161C`      | Documented in `DESIGN.md` §1 as the text/icon color for surfaces painted in `primary`/`chart-1` — guarantees contrast against the `chart-1`-filled box underneath it. |

Reference the CSS variables directly (`var(--color-chart-1)`) rather than hardcoding the hex — that is what keeps a chart consistent if `DESIGN.md`'s token values ever change, per the same token-over-literal rule that governs every other Tailwind v4 color usage in this project.

## Loading / Empty State with RTK Query

Per this project's data flow (`docs/architecture.md` §4), `WageBoxPlot` receives already-computed `WageBoxPlotPoint[]` from a hook backed by an RTK Query endpoint — it never fetches itself. Before the query has data (e.g. before the user completes step one of the multi-step form), `data` is `undefined`, not an empty array. Render a skeleton instead of feeding `undefined`/`[]` into the chart:

```tsx
function WageBoxPlotSection() {
  const { data, isLoading } = useGetWageStatsQuery();

  if (isLoading || !data) {
    return (
      <div
        className="h-[320px] w-full animate-pulse rounded-lg bg-surface"
        aria-label="Loading wage comparison"
      />
    );
  }

  if (data.length === 0) {
    return <p className="text-muted">No wage data available for this selection.</p>;
  }

  return <WageBoxPlot data={data} />;
}
```

Never render `BarChart`/`ResponsiveContainer` with an empty or `undefined` `data` array — Recharts will either render a blank chart frame with no error, or throw on the `shape` function dereferencing `payload` fields that don't exist, depending on which sub-component hits the missing data first. The `isLoading || !data` guard above must run before the chart mounts at all, not as a conditional inside it.
