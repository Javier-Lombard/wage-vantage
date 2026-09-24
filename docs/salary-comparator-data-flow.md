# Flujo de datos de salary-comparator: del click en un Combobox al repintado de MainChart

He trazado el flujo completo leyendo los 27 archivos implicados. Aquí va la explicación, y al final los dos diagramas que la acompañan.

---

## 1. Vista de conjunto

La feature tiene **un solo componente con conocimiento de datos**: [SalaryCalculator.tsx](../src/features/salary-comparator/components/SalaryCalculator.tsx). Todo lo demás es o presentacional (recibe props) o pura derivación (hooks y funciones sin estado). El formulario y la chart **nunca se hablan entre sí**: se comunican a través del estado que vive en el contenedor.

Un dato clave para entender todo lo demás: **el click en una opción produce una única petición**, y esa misma respuesta se bifurca en dos ramas:

- `options` → vuelve **hacia arriba**, al siguiente combobox de la cascada.
- `monthlyWages` / `aggregation` → baja **hacia la chart**.

No hay dos fetches, ni un fetch "de opciones" y otro "de datos". Es el mismo endpoint, `getWageInsights`, resolviendo ambas cosas en un `queryFn`.

---

## 2. Fase 1 — El click dentro del Combobox

Todo empieza en [Combobox.tsx:205-208](../src/shared/components/ui/Combobox.tsx#L205-L208), en el `<li role="option">`:

```tsx
onPointerDown={(event) => {
  event.preventDefault();
  selectOption(option, event.pointerType !== 'touch');
}}
```

Tres decisiones no obvias conviven en esas tres líneas:

**`onPointerDown` y no `onClick`.** El input tiene `onBlur={closeList}`. Si el handler fuese `click`, el orden de eventos sería `pointerdown → blur → (lista desmontada) → click que nunca llega`. Con `pointerdown` la selección se registra **antes** de que el blur cierre la lista.

**`preventDefault()`.** Impide que el `pointerdown` mueva el foco fuera del input, que es lo que provocaría ese blur prematuro.

**`event.pointerType !== 'touch'`.** Como el foco nunca se pierde (acabamos de impedirlo), en Android el teclado virtual se quedaba abierto tapando la pantalla tras elegir. Ese booleano viaja como `keepFocus` a `selectOption` ([Combobox.tsx:92-97](../src/shared/components/ui/Combobox.tsx#L92-L97)), que hace `blur()` en tap táctil y `focus()` en ratón o teclado —conservando el orden de tabulación en desktop.

`selectOption` hace exactamente tres cosas:

1. `onChange(option.value)` — dispara la cadena hacia arriba (todo lo que viene después de esta sección).
2. `closeList()` — `isOpen = false`, `query = ''`, `activeIndex = -1`.
3. `focus()` o `blur()` según `keepFocus`.

El resto de `Combobox` es infraestructura del control: `filterOptions` ([Combobox.tsx:33-37](../src/shared/components/ui/Combobox.tsx#L33-L37)) hace el filtrado por substring case-insensitive, `handleKeyDown` gestiona flechas/Enter/Escape, `useId` genera los ids de ARIA, y todo el envoltorio de label/helper/error lo pone [FieldShell.tsx](../src/shared/components/ui/FieldShell.tsx), con los estilos base en [controlClasses.ts](../src/shared/components/ui/controlClasses.ts).

Hay un detalle importante para más adelante: `displayValue` depende de `selectedOption`, que es `options.find(o => o.value === value)`. **Si el valor elegido no está en `options`, el input se ve vacío** aunque el estado sea correcto. Eso condiciona el diseño de la fase 6.

---

## 3. Fase 2 — La cadena de props hacia arriba

El `onChange` del Combobox recorre cinco componentes. La ruta depende del `kind` del campo, definido en [fieldConfig.ts](../src/features/salary-comparator/components/fieldConfig.ts):

| Ruta | Campos | Recorrido |
|---|---|---|
| **A** (opciones estáticas) | Gender, Years of Experience, Company Size | `Combobox` → `SalaryFormField` |
| **B** (opciones del servidor) | Country, Occupation, Occupation Level, Economic Activity, Education Level | `Combobox` → `CountryAwareCombobox` → `SalaryFormField` |
| **C** (numérico) | Monthly Wage | `Input` → `SalaryFormField` |

[SalaryFormField.tsx](../src/features/salary-comparator/components/SalaryFormField.tsx) es un **dispatcher por `kind`**: mira `field.kind` y decide qué control montar. En los tres casos el callback termina siendo el mismo:

```tsx
onChange={(selected) => onChange(field.id, selected)}
```

Y a partir de ahí sube por props, sin transformarse:

```
SalaryFormField.props.onChange
  ← SalaryFormStep.props.onChange          (SalaryFormStep.tsx:36)
  ← SalaryForm.props.onFieldChange         (SalaryForm.tsx:65)
  ← SalaryCalculator.handleFieldChange     (SalaryCalculator.tsx:207)
```

[SalaryFormStep.tsx](../src/features/salary-comparator/components/SalaryFormStep.tsx) solo hace `SALARY_FORM_FIELDS.filter(f => f.step === step)` y mapea. [SalaryForm.tsx](../src/features/salary-comparator/components/SalaryForm.tsx) es el chrome del formulario: el `StepBar`, los botones Back/Next, y los dos enlaces de template. **Ninguno de los dos toca el valor.**

---

## 4. Fase 3 — `handleFieldChange` en el contenedor

[SalaryCalculator.tsx:64-67](../src/features/salary-comparator/components/SalaryCalculator.tsx#L64-L67):

```tsx
const handleFieldChange = (id: keyof SalaryFormValues, value: string | number) => {
  setFieldValue(id, value);
  if (SCROLL_TRIGGERING_FIELDS.has(id)) scrollToChart();
};
```

**`setFieldValue`** viene de [useSalaryFormState.ts](../src/features/salary-comparator/hooks/useSalaryFormState.ts), que es el dueño de los 9 valores y del índice de paso. Hace un merge inmutable: `setValues(current => ({ ...current, [id]: value }))`. Ese hook también expone `canAdvance`, calculado por `isStepComplete` — que comprueba que **todos** los campos del paso actual tengan valor no vacío ni `NaN`. Es lo que habilita el botón "Next step".

Nota de arquitectura: este estado está *elevado* al contenedor, no dentro de `SalaryForm`. La razón está documentada en el propio hook: la chart necesita leer los mismos `values` sin que el formulario tenga que "alcanzar hacia arriba" con un callback.

**`SCROLL_TRIGGERING_FIELDS`** ([SalaryCalculator.tsx:36-40](../src/features/salary-comparator/components/SalaryCalculator.tsx#L36-L40)) se deriva de `SALARY_FORM_FIELDS` en lugar de ser una lista fija: son los campos que **no** son `combobox-static-no-filter` ni `number-input`, es decir, los 6 que provocan un fetch y por tanto cambian lo que se ve en la chart. `scrollToChart` es [useScrollToTop.ts](../src/shared/hooks/useScrollToTop.ts), que sube al top absoluto de la página (no `scrollIntoView`, para no dejar el navbar fuera), se salta el scroll si el borde superior de la chart ya es visible —caso desktop, con las dos columnas lado a lado— y respeta `prefers-reduced-motion`.

`setValues` provoca el re-render de `SalaryCalculator`. **Aquí es donde arranca todo el trabajo real.**

---

## 5. Fase 4 — `useWageInsights` deriva la query

En el nuevo render, [useWageInsights.ts](../src/features/salary-comparator/hooks/useWageInsights.ts) recibe los `values` actualizados y llama a `buildCascadeQuery`, que compone tres funciones puras:

### 5.1 `buildWageFilters(values)` — qué se filtra

[buildWageFilters.ts](../src/features/salary-comparator/hooks/buildWageFilters.ts) recorre `SALARY_FORM_FIELDS`, se queda con los campos que tienen `filterColumn` (los `combobox-fetched-options` y `combobox-static-but-filters`) y que tienen valor, y vuelca cada uno a su columna de Supabase:

```ts
filters[field.filterColumn] = value;   // p.ej. { Country: 'Spain', Gender: 'Male' }
```

Fíjate en el mapeo: el id del campo es camelCase (`occupationLevel`) pero la columna es el nombre real de TABLE_0 con espacios y mayúsculas (`'Occupation Level'`). Esa traducción vive **solo** aquí y en [wageApi.types.ts](../src/features/salary-comparator/api/wageApi.types.ts).

Si el objeto sale vacío, `buildCascadeQuery` devuelve `null` → la query se salta con `skip: true`. **Nada se pide antes de elegir País.**

### 5.2 `findNextOptionsField(values)` — quién recibe las opciones

Esta es la pieza que hace que la cascada sea una cascada ([useWageInsights.ts:15-33](../src/features/salary-comparator/hooks/useWageInsights.ts#L15-L33)). El algoritmo:

1. Recorre `SALARY_FORM_FIELDS` en orden y anota el **índice del último campo filtrable que tiene valor**.
2. Desde el índice siguiente, busca el **primer campo de tipo `combobox-fetched-options`** y devuelve su `filterColumn`.

Aplicado al orden real del array:

| Ya elegido | `lastFilledIndex` | `nextOptionsField` |
|---|---|---|
| (nada) | −1 | `undefined` → query en skip |
| Country | 0 | **Occupation** |
| Country + Gender | 1 | **Occupation** |
| + Occupation | 3 | **Occupation Level** |
| + Occupation Level | 4 | **Economic Activity** |
| + Economic Activity | 5 | **Education Level** |
| + Education Level | 6 | `undefined` — no quedan campos fetched |

Dos consecuencias que conviene ver:

- Elegir **País (paso 1)** ya carga las opciones de **Occupation (paso 2)**. La cascada va por delante del paso visible; cuando el usuario pulsa "Next step", las opciones ya están en caché.
- Gender es `combobox-static-but-filters`: **filtra** (entra en `filters`) pero **nunca es destino** de opciones, porque su lista está hardcodeada. Por eso puede ser `lastFilledIndex` pero nunca `nextOptionsField`.
- Tras Education Level, `nextOptionsField` es `undefined` → el endpoint **omite la segunda RPC** por completo.

### 5.3 `buildEnrichmentProfile(values)` — el perfil para la IA

[buildEnrichmentProfile.ts](../src/features/salary-comparator/hooks/buildEnrichmentProfile.ts) produce un mapeo distinto del anterior: 7 claves (Gender, Occupation, Occupation Level, Economic Activity, Education Level, Years Of Experience, Company Size) cuyos nombres los fija el **contrato de la Edge Function**, no el esquema de TABLE_0 — de ahí `'Years Of Experience'` con "Of" en mayúscula. `Country` no va aquí: viaja aparte en el body. Solo se usa si se dispara el fallback de Gemini.

### 5.4 La llamada a RTK Query

```ts
const query = useGetWageInsightsQuery(cascadeQuery ?? { filters: {} }, {
  skip: cascadeQuery === null,
});
return { ...query, nextOptionsField: cascadeQuery?.nextOptionsField };
```

RTK Query **serializa los args para formar la clave de caché**. Esto tiene un efecto práctico importante: escribir en Monthly Wage re-renderiza el contenedor y vuelve a construir un objeto `filters` nuevo, pero con el mismo contenido → misma clave → **cero peticiones**. El campo numérico no participa en el filtrado.

`nextOptionsField` se devuelve *junto* al resultado, no dentro de él: los consumidores necesitan saber **a qué campo pertenecen** las `options` que llegan.

---

## 6. Fase 5 — El `queryFn` de `wageApi`

[wageApi.ts](../src/features/salary-comparator/api/wageApi.ts) usa `fakeBaseQuery<Error>()`: no hay petición HTTP que RTK Query emita por sí sola, el fetch real lo hace `supabase.rpc()` dentro del `queryFn`.

### 6.1 Por qué RPC y no `select()`

Las dos consultas pasan por funciones de Postgres en vez de leer filas crudas porque el conteo por país llega a ~5.800 filas, por encima del tope global de 1.000 de PostgREST. Devolver un array ya agregado desde SQL esquiva ese límite y, de paso, deduplica opciones y filtra nulls en el servidor.

### 6.2 La secuencia

```ts
const wages = await supabase.rpc('wage_monthly_wages', { p_filters: filters });   // number[]

if (nextOptionsField) {
  const distinct = await supabase.rpc('wage_distinct_options', {
    p_filters: filters,
    p_field: nextOptionsField,
  });
  options = distinct.data;                                                        // string[]
}
```

Las dos RPC son **secuenciales** (dos `await` encadenados), no paralelas. La segunda solo existe si hay un destinatario para las opciones.

### 6.3 El umbral de muestra y el fallback de Gemini

```ts
const validCount = plausibleWages(wages.data).length;
if (country && validCount < MIN_SAMPLE_SIZE) { ... }   // MIN_SAMPLE_SIZE = 8
```

`plausibleWages` ([aggregateWages.ts:39-42](../src/features/salary-comparator/hooks/aggregateWages.ts#L39-L42)) descarta todo lo que supere `MAX_PLAUSIBLE_WAGE = 15000`. TABLE_0 arrastra outliers absurdos (en Francia hay registros de 23.399.999.488 €/mes) y algún país en moneda local sin convertir. **El umbral se mide sobre el conteo ya truncado**: los outliers no deben rellenar la muestra ni ocultar que hay pocos datos reales.

Si la muestra es escasa, [enrichSalaryData.ts](../src/features/salary-comparator/api/enrichSalaryData.ts) invoca `supabase.functions.invoke('enrich-salary-data', { body: { country, formValues } })`. La Edge Function llama a Gemini server-side (la API key nunca llega al navegador) y devuelve `{ category, min, q1, median, q3, max }`. El type guard `isEnrichSalaryResponse` estrecha ese `unknown` y descarta `category`. Este archivo es **el único punto de la feature que toca `supabase.functions`**.

Después:

```ts
const real = aggregateWages(wages.data);
const aggregation = real === null ? estimate : mergeAggregations(real, estimate);
```

`mergeAggregations` ([mergeAggregations.ts](../src/features/salary-comparator/hooks/mergeAggregations.ts)) promedia **percentil a percentil** —no sintetiza un array de puntos falsos— con un clamp defensivo que garantiza `min ≤ q1 ≤ median ≤ q3 ≤ max`, invariante que `MainChart` asume para dibujar la caja.

El resultado es un `WageInsightsResult` ([types.ts](../src/features/salary-comparator/types.ts)):

```ts
{ monthlyWages: number[], options?: string[], aggregation?: WageAggregation }
```

`aggregation` **solo está presente si hubo enriquecimiento**. Ese campo opcional es la señal que la fase siguiente interpreta.

`keepUnusedDataFor: 300` (5 min) se fija pensando en el peor caso: avanzar y retroceder pasos, o añadir y quitar países, no debe re-invocar la IA para los mismos filtros.

---

## 7. Fase 6a — La rama de las opciones (vuelta al formulario)

El contenedor reparte tres props relacionadas ([SalaryCalculator.tsx:211-213](../src/features/salary-comparator/components/SalaryCalculator.tsx#L211-L213)):

```tsx
fetchedOptions={data?.options}
isFetchingOptions={isFetching}
nextOptionsField={nextOptionsField}
```

Bajan intactas por `SalaryForm` → `SalaryFormStep` → **cada uno** de los `SalaryFormField` del paso. Es decir: los tres campos del paso 2 reciben **el mismo** array de opciones, que solo es correcto para uno de ellos.

### 7.1 `isLiveTarget` — el filtro que resuelve la ambigüedad

[SalaryFormField.tsx:62](../src/features/salary-comparator/components/SalaryFormField.tsx#L62):

```tsx
const isLiveTarget = field.id === 'country' || field.filterColumn === nextOptionsField;
...
fetchedOptions={isLiveTarget ? fetchedOptions : undefined}
isFetchingOptions={isLiveTarget && isFetchingOptions}
```

Sin esto, un campo ya contestado renderizaría las opciones de *otro* campo como suyas — y además **se vería vacío**, porque su propio valor no estaría entre ellas (recuerda `selectedOption` de la fase 1). `country` está exento porque su fuente es otra.

### 7.2 `CountryAwareCombobox` — el caso especial de País

[CountryAwareCombobox.tsx](../src/features/salary-comparator/components/CountryAwareCombobox.tsx) existe por una razón concreta de reglas de hooks: País es el único campo `combobox-fetched-options` **sin filtros acumulados**, así que sus opciones vienen del endpoint dedicado `getCountryOptions` (`keepUnusedDataFor: Infinity` — los 11 países no cambian en caliente, cero refetches en toda la sesión). Ese hook no podía llamarse condicionalmente dentro del cuerpo de render de `SalaryFormField`, así que se aisló en su propio componente.

Hace tres cosas:

1. **Elige la fuente**: `isCountryField ? countryQuery.data : fetchedOptions`.
2. **Aplica `excludeOptions`** si las hay — solo lo usa [CompareCountryModal.tsx](../src/features/salary-comparator/components/CompareCountryModal.tsx), para que no puedas comparar un país consigo mismo ni añadir un duplicado.
3. **`optionsWithOwnValue`** ([CountryAwareCombobox.tsx:47-48](../src/features/salary-comparator/components/CountryAwareCombobox.tsx#L47-L48)): si el campo ya tiene valor y ese valor no está en `options`, lo añade. Es exactamente el parche al efecto secundario de `isLiveTarget` — un campo contestado deja de recibir opciones vivas, y sin esta línea se vería en blanco.

Mientras carga, el combobox va `disabled` con placeholder `"Loading..."`.

### 7.3 El último paso

[toComboboxOptions.ts](../src/features/salary-comparator/components/toComboboxOptions.ts) envuelve el `string[]` en el shape `{ value, label }` que espera `Combobox`, y el ciclo se cierra: **el siguiente combobox ya tiene sus opciones**.

---

## 8. Fase 6b — La rama de la chart

### 8.1 `useResolvedAggregation`

[useResolvedAggregation.ts](../src/features/salary-comparator/hooks/useResolvedAggregation.ts) resuelve el dilema del campo `aggregation` opcional:

```ts
const derived = useWageStats(data?.monthlyWages);
return data?.aggregation ?? derived;
```

`useWageStats` se llama **siempre e incondicionalmente**. Si cada consumidor escribiese `data?.aggregation ?? useWageStats(...)`, el hook quedaría a la derecha de `??` y solo se ejecutaría a veces — violación de las reglas de hooks. Encapsularlo aquí lo evita.

[useWageStats.ts](../src/features/salary-comparator/hooks/useWageStats.ts) es un `useMemo` sobre `aggregateWages`, que ordena los salarios plausibles y calcula min / Q1 / mediana / Q3 / max con interpolación lineal (el método por defecto de Excel y numpy).

`aggregateWages` vive como **función pura en `hooks/` y no como hook** precisamente porque tiene dos consumidores incompatibles: `useWageStats` (en render) y el `queryFn` de `wageApi` (fuera de React, donde no se puede llamar a un hook).

Aguas abajo esto es **transparente**: `MainChart` recibe siempre un `WageAggregation` y no sabe si vino de datos reales, de Gemini, o de la fusión de ambos.

### 8.2 Los países de comparación (rama paralela)

[useCountryComparison.ts](../src/features/salary-comparator/hooks/useCountryComparison.ts) es dueño de la lista `extraCountries` y de la política de gate (guest → login, free → upgrade, premium → sin gate), leyendo `limits.maxCountries` de `useFeatureAccess` de la feature premium. **No dispara fetches.**

Los fetches los hace [ComparisonCountryQuery.tsx](../src/features/salary-comparator/components/ComparisonCountryQuery.tsx), un componente que **renderiza `null`**. Existe solo porque RTK Query expone sus datos vía hooks y las reglas de React prohíben llamar hooks un número variable de veces (uno por país). `SalaryCalculator` monta uno por país extra ([SalaryCalculator.tsx:234-242](../src/features/salary-comparator/components/SalaryCalculator.tsx#L234-L242)), cada uno con `{ ...baseFilters, Country: country }` — mismos filtros del formulario con el país sobrescrito.

Cada uno deriva su agregación con el mismo `useResolvedAggregation` y la eleva con `onResult(country, aggregation, isFetching)`. En el padre, `handleComparisonResult` está memoizado con `useCallback` (es dependencia del `useEffect` de notificación; una referencia inestable lo re-dispararía en cada render) y mantiene dos estructuras: un `Map<string, WageAggregation>` y un `Set<string>` de países con petición en vuelo. El `Set` se une a `isFetching` del país base para decidir el loader.

### 8.3 El montaje de `series`

[SalaryCalculator.tsx:179-185](../src/features/salary-comparator/components/SalaryCalculator.tsx#L179-L185):

```ts
const series = [
  ...(values.country ? [{ country: values.country, aggregation }] : []),
  ...extraCountries.map((country) => ({
    country,
    aggregation: comparisonAggregations.get(country) ?? null,
  })),
];
```

El orden importa: **el país base siempre primero**, porque `MainChart` asigna los colores por índice.

---

## 9. Fase 7 — `MainChart` pinta

[MainChart.tsx](../src/features/salary-comparator/components/MainChart.tsx) es **puramente presentacional**: recibe agregaciones ya calculadas, nunca consulta ni deriva. Va envuelto en un `ErrorBoundary`. Tiene tres estados excluyentes:

**1. `!hasStarted`** (`hasStarted = Boolean(values.country)`) → la chart no existe en el DOM; solo el `Logo` y el texto guía.

**2. `isLoading || !baseAggregation`** → [GeminiEnrichmentLoader.tsx](../src/features/salary-comparator/components/GeminiEnrichmentLoader.tsx), que rota tres frases cada 2 s con `AnimatePresence` de motion. Nota honesta que ya está documentada en el propio archivo: como las RPC y Gemini ocurren dentro del mismo `queryFn`, no hay señal separada de "esperando IA", así que las frases rotan durante toda la ventana de `isFetching`, no solo durante el enriquecimiento real.

**3. Datos listos** → construye `chartData`:

```ts
series
  .map(({ country, aggregation }, index) =>
    aggregation ? toBoxPlotDatum(aggregation, country, SERIES_COLORS[index % SERIES_COLORS.length]) : null)
  .filter((datum): datum is BoxPlotDatum => datum !== null);
```

Los países cuyo fetch aún no resolvió se **omiten**, nunca se pasa un datum a medias a Recharts.

### 9.1 `toBoxPlotDatum` — el truco del box-plot

Recharts no tiene `BoxPlot` nativo. [toBoxPlotDatum.ts](../src/features/salary-comparator/components/toBoxPlotDatum.ts) traduce las 5 estadísticas a las 3 claves que Recharts sí sabe dibujar:

| Clave | Valor | Para qué |
|---|---|---|
| `baseOffset` | `q1` | Bar **invisible** que levanta la caja de 0 hasta Q1 |
| `boxHeight` | `q3 - q1` | Bar visible apilado encima — la caja real |
| `whiskerRange` | `[q3 - min, max - q3]` | Los bigotes, vía `ErrorBar` |

El detalle no evidente es `whiskerRange`: en un Bar apilado, `ErrorBar` toma como referencia el **valor acumulado más alto** del stack (`baseOffset + boxHeight = q3`), no `q1`. Por eso el extremo inferior es `q3 - min` y no `q1 - min`; con lo segundo el bigote se detendría en `q3 - q1 + min`.

### 9.2 Los shapes custom

`BoxWithMedian` ([MainChart.tsx:62-81](../src/features/salary-comparator/components/MainChart.tsx#L62-L81)) dibuja el `<rect>` con el color del propio datum —para poder distinguir varios países en la misma serie de Bars— y la línea de mediana. El `1 - medianRatio` está ahí porque el eje Y de Recharts está invertido en píxeles: valor mayor → `y` menor.

`BoxPlotTooltip` ([MainChart.tsx:93-150](../src/features/salary-comparator/components/MainChart.tsx#L93-L150)) ignora los `dataKey` montados (`baseOffset`, `boxHeight` son artefactos del truco visual, no significan nada para el usuario) y lee `payload[0].payload` —el `BoxPlotDatum` completo— para mostrar las cinco estadísticas reales.

### 9.3 El resto de la composición

`ResponsiveContainer` → `BarChart` (con `barCategoryGap` al 25 % cuando hay un solo país, para que la barra no ocupe toda la categoría), `CartesianGrid`, `XAxis` **sin ticks** (la relación color↔país vive solo en la leyenda de chips al pie, sin duplicar), `YAxis` con `tickFormatter={formatEur}`, `Tooltip` con `cursor.stroke: 'transparent'` (anula el marco gris que Recharts dibuja por defecto), y una `ReferenceLine` roja discontinua en `userWage` si el usuario rellenó Monthly Wage.

---

## 10. Recorrido concreto de ejemplo

Usuario en el paso 2, ya con `{ country: 'Spain', gender: 'Male' }`, elige **Occupation = "Nurse"**:

1. `pointerdown` en la `<li>` → `selectOption` → `onChange('Nurse')` → `closeList()`.
2. Sube: `CountryAwareCombobox` → `SalaryFormField('occupation', 'Nurse')` → `SalaryFormStep` → `SalaryForm` → `SalaryCalculator`.
3. `setFieldValue` actualiza `values`; `occupation` está en `SCROLL_TRIGGERING_FIELDS` → `scrollToChart()` (no hace nada en desktop si la chart ya se ve).
4. Re-render → `useWageInsights`: `filters = { Country: 'Spain', Gender: 'Male', Occupation: 'Nurse' }`, `nextOptionsField = 'Occupation Level'`.
5. Clave de caché nueva → `queryFn`: RPC `wage_monthly_wages` con esos 3 filtros, y RPC `wage_distinct_options` con `p_field: 'Occupation Level'`.
6. `plausibleWages` cuenta 340 salarios ≥ 8 → **no** hay llamada a Gemini. Devuelve `{ monthlyWages, options: ['Junior', 'Mid', 'Senior', ...] }` sin `aggregation`.
7. **Rama A**: `options` baja al paso 2. Occupation ya no es `isLiveTarget` (su `filterColumn` ya no coincide) y conserva "Nurse" gracias a `optionsWithOwnValue`; **Occupation Level** sí lo es y recibe la lista.
8. **Rama B**: `useResolvedAggregation` ve `data.aggregation === undefined` → usa la derivada de `useWageStats(monthlyWages)`. `series = [{ country: 'Spain', aggregation }]`.
9. `MainChart` sale del loader, construye un `BoxPlotDatum` con `chart-1` y Recharts repinta la caja con su mediana, sus bigotes y la línea "Your monthly wage".

---

## 11. Diagramas generados

He seguido la convención que ya existía en [docs/diagrams/](diagrams/) (fondos oscuros, borde saturado, texto casi blanco — contraste alto en cualquier tema del visor) y he ampliado la paleta a 12 tipos de archivo:

**[docs/diagrams/salary-cascade-flow.md](diagrams/salary-cascade-flow.md)** — el flujo en el eje temporal: 29 pasos numerados desde el `pointerdown` hasta el repintado, con las tres bifurcaciones reales (query en skip, muestra escasa → Gemini, `real === null` vs. fusión) y las dos ramas de reparto de la respuesta.

**[docs/diagrams/salary-comparator-file-map.md](diagrams/salary-comparator-file-map.md)** — el mapa estructural: los 27 archivos agrupados por capa con sus relaciones de import, donde se ve de un vistazo que `fieldConfig.ts` tiene cinco consumidores y que `supabaseClient.ts` es el único paso hacia el backend.

Ambos llevan leyenda de colores integrada como subgrafo y notas al pie con las decisiones de diseño que el dibujo no puede expresar.

Dos apuntes sobre los diagramas ya existentes, por si quieres decidir qué hacer con ellos: [salary-boxplot-pipeline.md](diagrams/salary-boxplot-pipeline.md) se quedó algo desfasado (dibuja `useWageStats` conectado directamente a `MainChart`, sin `useResolvedAggregation` ni `SalaryCalculator`, que hoy son parte del camino). [gemini-enrichment-flow.md](diagrams/gemini-enrichment-flow.md) sí está al día y los nuevos lo referencian en lugar de duplicar su detalle. No he tocado ninguno de los dos.
