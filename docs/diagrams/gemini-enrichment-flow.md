# Flujo de enriquecimiento con Gemini (muestras escasas)

Cuando la RPC de Supabase devuelve una muestra de salarios demasiado pequeña
para ser estadísticamente significativa (menos de `MIN_SAMPLE_SIZE = 8`
salarios plausibles, tras descartar outliers), el `queryFn` de
`getWageInsights` invoca la Edge Function `enrich-salary-data` (que llama a
Gemini server-side) y fusiona su estimación con los pocos datos reales. Todo
esto es invisible aguas abajo: `MainChart` pinta el box-plot sin saber si hubo
fallback.

Archivos clave:

- `src/features/salary-comparator/api/wageApi.ts` — `queryFn` de `getWageInsights` (orquesta el flujo).
- `src/features/salary-comparator/hooks/aggregateWages.ts` — `plausibleWages` (filtro de outliers + conteo) y `aggregateWages` (percentiles).
- `src/features/salary-comparator/api/enrichSalaryData.ts` — `invokeEnrichSalaryData` (wrapper tipado sobre la Edge Function).
- `src/features/salary-comparator/hooks/mergeAggregations.ts` — `mergeAggregations` (media percentil-a-percentil + clamp de monotonía).
- `src/features/salary-comparator/hooks/useResolvedAggregation.ts` — prefiere `data.aggregation` sobre recalcular.

```mermaid
flowchart TD
    Start(["getWageInsights queryFn\nargs: filters, enrichmentProfile"]) -->|"RPC wage_monthly_wages(p_filters)"| DB[("Supabase\nPostgres")]
    DB -->|"monthlyWages: number[] (crudo)"| Count["plausibleWages(monthlyWages)\ndescarta outliers > 15.000€"]
    Count -->|"validCount = nº salarios plausibles"| Decide{"country presente\nY validCount < 8 ?"}

    Decide -->|"No (muestra suficiente\no sin país)"| NoEnrich["return { monthlyWages, options }\nSIN aggregation"]

    Decide -->|"Sí (muestra escasa)"| Invoke["invokeEnrichSalaryData(country, enrichmentProfile)"]
    Invoke -->|"functions.invoke('enrich-salary-data',\n{ body: { country, formValues } })"| Edge[["Edge Function\nenrich-salary-data"]]
    Edge -->|"prompt con perfil de 8 campos"| Gemini[["API Gemini\n(key server-side)"]]
    Gemini -->|"{ category, min, q1, median, q3, max }"| Edge
    Edge -->|"respuesta JSON"| Validate["isEnrichSalaryResponse(data)\nnarrowing de unknown, descarta category"]

    Validate -->|"shape inválido\no invoke con error"| Err["throw → queryFn captura\nreturn { error }"]
    Validate -->|"WageAggregation válida (estimate)"| RealAgg["aggregateWages(monthlyWages)\npercentiles de los reales (o null)"]

    RealAgg -->|"real === null\n(0 salarios reales)"| UseGemini["aggregation = estimate\n(solo Gemini)"]
    RealAgg -->|"real !== null\n(1–7 salarios reales)"| Merge["mergeAggregations(real, estimate)\nmedia percentil-a-percentil + clamp monótono"]

    UseGemini --> Enriched["return { monthlyWages, options, aggregation }"]
    Merge --> Enriched

    NoEnrich -->|"data: WageInsightsResult"| Resolve["useResolvedAggregation(data)"]
    Enriched -->|"data: WageInsightsResult\ncon aggregation"| Resolve
    Err -->|"error"| ChartErr["MainChart → skeleton /\npaís omitido"]

    Resolve -->|"data.aggregation ??\nuseWageStats(monthlyWages)"| Chart["MainChart\n(no sabe si hubo fallback)"]
    Chart -->|"WageAggregation → BoxPlotDatum"| Recharts["Recharts BarChart + ErrorBar"]
```

## Notas sobre el flujo

- **El umbral se mide tras truncar** (`validCount`, no `monthlyWages.length`):
  los outliers de TABLE_0 no deben rellenar la muestra ni ocultar que hay pocos
  datos reales.
- **La API key de Gemini nunca llega al cliente**: el navegador solo invoca la
  Edge Function; la key vive como secret del proyecto Supabase.
- **`category` se descarta**: la Edge Function devuelve el nombre del país en
  `category`, pero los consumidores esperan un `WageAggregation` limpio
  (`{ min, q1, median, q3, max }`).
- **Fusión, no reemplazo** (salvo con 0 reales): con 1–7 salarios reales, la
  estimación de Gemini se promedia percentil-a-percentil con la agregación de
  los reales — no se sintetiza ningún array intermedio.
- **Los errores se propagan** (no se degrada en silencio): un fallo de la Edge
  Function o un país fuera de los 11 válidos devuelve `{ error }`, y `MainChart`
  muestra su estado de skeleton/error.
- **Transparencia aguas abajo**: `useResolvedAggregation` decide entre usar el
  `aggregation` ya resuelto (fallback) o derivar de `monthlyWages`; `MainChart`
  recibe siempre un `WageAggregation` y no distingue el origen.
- **Caché**: `getWageInsights` cachea por args (`keepUnusedDataFor: 300` s), así
  que revisitar la misma combinación de filtros dentro de 5 min no re-invoca a
  Gemini.
