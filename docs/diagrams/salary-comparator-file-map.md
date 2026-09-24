# Mapa de archivos de la feature salary-comparator

Vista estructural (quién importa a quién, no el orden temporal): los 27
archivos que participan en el calculador, agrupados por capa y coloreados por
tipo. Complementa a `docs/diagrams/salary-cascade-flow.md`, que recorre el mismo
sistema en el eje del tiempo.

Dos reglas de arquitectura se leen directamente en el dibujo:

1. **`fieldConfig.ts` es la fuente única de verdad del formulario.** Los 9
   campos son datos, no JSX, y lo leen cinco módulos distintos: los dos
   componentes que renderizan pasos, los dos que derivan filtros y el propio
   contenedor (para saber qué campos disparan scroll).
2. **Solo `SalaryCalculator` habla con la capa de datos.** `SalaryForm` y
   `MainChart` reciben todo por props; ninguno importa `wageApi` ni Supabase.

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#0b1220","fontFamily":"Poppins, Segoe UI, sans-serif","fontSize":"14px","textColor":"#e2e8f0","lineColor":"#94a3b8","edgeLabelBackground":"#0b1220","clusterBkg":"#0f172a","clusterBorder":"#334155","titleColor":"#f8fafc"}}}%%
flowchart LR
    classDef app      fill:#12203d,stroke:#818cf8,color:#e0e7ff,stroke-width:2px
    classDef page     fill:#111c33,stroke:#93c5fd,color:#eaf2ff,stroke-width:2px
    classDef feature  fill:#1e3a5f,stroke:#60a5fa,color:#e0f0ff,stroke-width:2px
    classDef sharedui fill:#0e3a45,stroke:#22d3ee,color:#cffafe,stroke-width:2px
    classDef hook     fill:#2d1b4e,stroke:#a78bfa,color:#ede9fe,stroke-width:2px
    classDef pure     fill:#3a2410,stroke:#fb923c,color:#ffedd5,stroke-width:2px
    classDef config   fill:#4a3208,stroke:#fbbf24,color:#fef3c7,stroke-width:3px
    classDef api      fill:#12352a,stroke:#34d399,color:#d1fae5,stroke-width:2px
    classDef types    fill:#242b3d,stroke:#cbd5e1,color:#f1f5f9,stroke-width:2px
    classDef db       fill:#3b1f1f,stroke:#f87171,color:#fee2e2,stroke-width:2px
    classDef ai       fill:#3b1030,stroke:#f472b6,color:#fce7f3,stroke-width:2px
    classDef chart    fill:#2a2010,stroke:#facc15,color:#fef9c3,stroke-width:2px

    subgraph A ["src/main.tsx y src/app — arranque"]
        MainTsx["main.tsx<br/>Provider store"]:::app
        Store["store.ts<br/>wageApi.reducer + middleware"]:::app
    end

    subgraph P ["src/pages — ensamblador fino"]
        Home["Home.tsx<br/>landmark main + widget"]:::page
    end

    subgraph FC ["features/salary-comparator/components"]
        Calc["SalaryCalculator.tsx<br/>contenedor · layout responsive<br/>cablea hooks y reparte props"]:::feature
        Form["SalaryForm.tsx<br/>StepBar + botones + enlaces de template"]:::feature
        Stp["SalaryFormStep.tsx<br/>filtra los campos del paso"]:::feature
        Fld["SalaryFormField.tsx<br/>elige control según kind<br/>calcula isLiveTarget"]:::feature
        CAC["CountryAwareCombobox.tsx<br/>País desde su propio endpoint"]:::feature
        Modal["CompareCountryModal.tsx<br/>reutiliza el combobox de País"]:::feature
        CCQ["ComparisonCountryQuery.tsx<br/>render null · una query por país extra"]:::feature
        Chart["MainChart.tsx<br/>presentacional puro<br/>BoxWithMedian + BoxPlotTooltip"]:::chart
        Loader["GeminiEnrichmentLoader.tsx"]:::chart
        Cfg["fieldConfig.ts<br/>SALARY_FORM_FIELDS · 4 kinds"]:::config
        TBP["toBoxPlotDatum.ts<br/>SERIES_COLORS · formatEur"]:::pure
        TCO["toComboboxOptions.ts"]:::pure
    end

    subgraph FH ["features/salary-comparator/hooks"]
        SFS["useSalaryFormState.ts<br/>step + values + canAdvance"]:::hook
        UWI["useWageInsights.ts<br/>cascada + skip"]:::hook
        URA["useResolvedAggregation.ts"]:::hook
        UWS["useWageStats.ts"]:::hook
        UCC["useCountryComparison.ts<br/>países extra + gate de tier"]:::hook
        BWF["buildWageFilters.ts"]:::pure
        BEP["buildEnrichmentProfile.ts"]:::pure
        AGW["aggregateWages.ts<br/>plausibleWages + percentiles"]:::pure
        MRG["mergeAggregations.ts"]:::pure
    end

    subgraph FA ["features/salary-comparator/api y types"]
        WApi["wageApi.ts<br/>getWageInsights + getCountryOptions"]:::api
        ESD["enrichSalaryData.ts<br/>único punto que toca functions.invoke"]:::api
        WTypes["wageApi.types.ts<br/>shapes crudos de Supabase"]:::types
        DTypes["types.ts<br/>SalaryFormValues · WageAggregation"]:::types
        Barrel["index.ts<br/>API pública de la feature"]:::types
    end

    subgraph SH ["src/shared"]
        CB["ui/Combobox.tsx<br/>filtrado, teclado y ARIA"]:::sharedui
        FS["ui/FieldShell.tsx<br/>label + helper + error"]:::sharedui
        Ctrl["ui/controlClasses.ts"]:::sharedui
        Inp["ui/Input.tsx"]:::sharedui
        Misc["ui/StepBar · Button · Icon<br/>Modal · Badge · ErrorBoundary · Logo · Text"]:::sharedui
        UST["hooks/useScrollToTop.ts"]:::hook
        UD["hooks/useDisclosure.ts"]:::hook
        SB["lib/supabaseClient.ts"]:::api
    end

    subgraph BE ["Backend"]
        RPC1[("wage_monthly_wages")]:::db
        RPC2[("wage_distinct_options")]:::db
        EF[["enrich-salary-data<br/>Edge Function"]]:::ai
        GM[["API Gemini"]]:::ai
    end

    MainTsx --> Store
    Store -->|"registra el reducer"| WApi
    Home --> Barrel
    Barrel --> Calc

    Calc --> Form
    Calc --> Chart
    Calc --> Modal
    Calc --> CCQ
    Calc --> SFS
    Calc --> UWI
    Calc --> URA
    Calc --> UCC
    Calc --> BWF
    Calc --> BEP
    Calc --> UST
    Calc --> UD
    Calc --> Cfg

    Form --> Stp
    Form --> Misc
    Stp --> Cfg
    Stp --> Fld
    Fld --> Cfg
    Fld --> CAC
    Fld --> CB
    Fld --> Inp
    Fld --> TCO
    CAC --> CB
    CAC --> TCO
    CAC --> WApi
    Modal --> CAC
    Modal --> Cfg
    Modal --> Misc
    CCQ --> WApi
    CCQ --> URA
    Chart --> Loader
    Chart --> TBP
    Chart --> Misc

    CB --> FS
    CB --> Ctrl
    Inp --> FS

    SFS --> Cfg
    UWI --> Cfg
    UWI --> BWF
    UWI --> BEP
    UWI --> WApi
    BWF --> Cfg
    URA --> UWS
    UWS --> AGW

    WApi --> AGW
    WApi --> MRG
    WApi --> ESD
    WApi --> SB
    WApi --> WTypes
    WApi --> DTypes
    ESD --> SB
    ESD --> WTypes

    SB -->|"supabase.rpc"| RPC1
    SB -->|"supabase.rpc"| RPC2
    SB -->|"functions.invoke"| EF
    EF --> GM

    subgraph LEG ["Leyenda por tipo de archivo"]
        direction LR
        LG0["app / store"]:::app
        LG1["page"]:::page
        LG2["componente de feature"]:::feature
        LG3["shared/components/ui"]:::sharedui
        LG4["hook"]:::hook
        LG5["función pura"]:::pure
        LG6["config de datos"]:::config
        LG7["api / RTK Query"]:::api
        LG8["tipos / barrel"]:::types
        LG9["Supabase RPC"]:::db
        LG10["IA server-side"]:::ai
        LG11["chart"]:::chart
    end
```

## Lecturas del mapa

- **`fieldConfig.ts` (amarillo, borde grueso) tiene cinco entradas**: añadir,
  reordenar o reagrupar un campo se hace ahí y nada más — ni los componentes de
  paso ni los constructores de filtros necesitan tocarse (OCP).
- **`supabaseClient.ts` es el único cuello de botella hacia el backend**, y solo
  lo importan `wageApi.ts` y `enrichSalaryData.ts`. Ningún componente conoce
  Supabase (SoC).
- **`aggregateWages.ts` es función pura, no hook**, precisamente porque la
  necesitan dos consumidores incompatibles: `useWageStats` (en render) y el
  `queryFn` de `wageApi` (fuera de React, donde no se puede llamar a un hook).
- **`ComparisonCountryQuery` renderiza `null`**: existe solo para poder llamar
  al hook de RTK Query un número variable de veces sin romper las reglas de
  hooks; un bucle de hooks sería ilegal.
- **`CountryAwareCombobox` tiene dos consumidores** (`SalaryFormField` y
  `CompareCountryModal`), y por eso acepta `excludeOptions`: el modal excluye el
  país base y los ya añadidos.
