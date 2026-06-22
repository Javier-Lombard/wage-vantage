# Conventions — Wage Comparator

TypeScript, naming, and component patterns for this codebase. Referenced from `CLAUDE.md`.

---

## 1. TypeScript

### `verbatimModuleSyntax` is ON — this changes how you import types

`tsconfig.app.json` has `"verbatimModuleSyntax": true`. This is not optional styling — it changes compiler behavior. Type-only imports **must** use `import type`, or the build fails:

```ts
// ✅ correct
import type { WageRecord } from '@/shared/types';
import { useSelector } from 'react-redux';

// ❌ breaks the build — Country is a type, not a value
import { Country } from '@/shared/types';
```

If a module exports both types and values and you need both, split the import:

```ts
import { wageApi } from './wageApi';
import type { WageQueryParams } from './wageApi';
```

### No `any`. No `as` casting as a first resort

`eslint.config.js` runs `tseslint.configs.recommendedTypeChecked` (type-aware linting, active as of the alias/lint setup pass — confirm against the live file if this doc and the codebase ever drift). This is one step up from plain `recommended`, but still **not** the `strict`/`strictTypeChecked` preset — we deliberately stayed at the intermediate tier given the team's current TypeScript proficiency, per typescript-eslint's own guidance that `strict-type-checked` is best suited to teams already highly fluent in TS. That means most unsafe patterns get flagged by the linter now, but `any` itself isn't hard-banned by a dedicated rule — treat it as forbidden by convention anyway. Prefer `unknown` + narrowing, or a proper type. If you genuinely can't type something (e.g. a loosely-typed third-party return), isolate it behind a single typed wrapper function rather than scattering `as` casts through the codebase.

### Type unions for closed sets of values

Use `type` (lowercase, descriptive) for closed string/value unions — these map directly to filter values from the Supabase table:

```ts
type Gender = 'male' | 'female' | 'no-defined';
type EducationLevel = 'primary' | 'secondary' | 'tertiary' | 'postgraduate';
```

### `interface` for object shapes, `type` for everything else

- Component props → `interface` (see §3).
- Object shapes in general (API responses, store slices) → `interface`.
- Unions, intersections, mapped/conditional types, function signatures used as values → `type`.

```ts
// Object shape → interface
interface WageRecord {
  country: string;
  gender: Gender;
  monthlyWage: number;
}

// Union → type
type SortDirection = 'asc' | 'desc';

// Function type → type
type WageFormatter = (value: number) => string;
```

### No enums — use union types or `as const` objects

TypeScript `enum` generates runtime code and doesn't tree-shake well. Use string unions for closed sets (above), or `as const` objects when you need both the values and a reverse lookup:

```ts
const OCCUPATION_LEVEL = {
  Junior: 'junior',
  Mid: 'mid',
  Senior: 'senior',
} as const;

type OccupationLevel = (typeof OCCUPATION_LEVEL)[keyof typeof OCCUPATION_LEVEL];
```

---

## 2. Naming

| What                                            | Convention                   | Example                             |
| ----------------------------------------------- | ---------------------------- | ----------------------------------- |
| Component files                                 | `PascalCase.tsx`             | `SalaryForm.tsx`                    |
| Non-component files (hooks, utils, slices, api) | `camelCase.ts`               | `useFeatureAccess.ts`, `wageApi.ts` |
| Folders                                         | `kebab-case`                 | `salary-calculator/`                |
| Components (the function/export itself)         | `PascalCase`                 | `function SalaryForm()`             |
| Hooks                                           | `camelCase`, prefixed `use`  | `useFeatureAccess`                  |
| Functions (non-hook)                            | `camelCase`, verb-first      | `calculateMedian`, `formatCurrency` |
| Types / interfaces                              | `PascalCase`                 | `WageRecord`, `SortDirection`       |
| Constants (module-level, immutable)             | `UPPER_SNAKE_CASE`           | `MAX_COMPARISON_COUNTRIES`          |
| RTK slices                                      | `camelCase` + `Slice` suffix | `authSlice.ts`, `wageFormSlice.ts`  |
| RTK Query API modules                           | `camelCase` + `Api` suffix   | `wageApi.ts`                        |

**Why PascalCase for component files specifically**: it matches the named export 1:1 (`SalaryForm.tsx` exports `SalaryForm`), so editor auto-import never has to guess casing between file name and symbol name. Hooks and utils stay camelCase because that's what their own exported symbol looks like too (`useFeatureAccess.ts` exports `useFeatureAccess`).

**No barrel re-export ambiguity**: feature `index.ts` files (currently empty placeholders) should only re-export the feature's _public_ surface — the components/hooks other features are allowed to import. Internal helpers stay un-exported from the barrel even if they're exported from their own file.

---

## 3. Component Patterns

### Named exports, always

```tsx
// ✅ SalaryForm.tsx
export function SalaryForm({ step, onNext }: SalaryFormProps) {
  // ...
}

// ❌ never default export a component
export default function SalaryForm() {
  /* ... */
}
```

Exception: files that frameworks specifically expect a default export from (e.g. `vite.config.ts`, route-level lazy-loaded pages if React Router's `lazy()` convention requires it for a specific case). Components themselves: never.

### Props: `interface`, named `<ComponentName>Props`

```tsx
interface SalaryFormProps {
  step: 1 | 2 | 3;
  onNext: (values: StepValues) => void;
  isLoading?: boolean;
}

export function SalaryForm({ step, onNext, isLoading = false }: SalaryFormProps) {
  // ...
}
```

Destructure props in the function signature, not inside the body, unless there are so many that destructuring inline hurts readability — at that point, consider whether the component is doing too much.

### One component per file, file name = export name

No multi-component files "because they're related." If two components are tightly coupled (e.g. a parent and a sub-component only ever used inside it), the sub-component still gets its own file — colocate them in the same folder, don't merge them into one file.

**Context + Provider + hook is one responsibility split across three files, not an exception to this rule.** A file that exports both a component (e.g. `AuthProvider`) and a non-component (a context object, a hook) breaks Vite Fast Refresh — ESLint's `react-refresh/only-export-components` rule catches this. The fix isn't a workaround, it's the correct shape: each context gets its own `XContext.ts` (just `createContext()` + the context's type, no JSX), its own `XProvider.tsx` (only the component), and its own `useX.ts` (only the consuming hook, throwing if used outside the provider). `src/app/providers/AuthContext.ts` / `AuthProvider.tsx` / `useAuth.ts` (and the equivalent for `Theme`) are the reference example already applied in this codebase — follow that same three-way split for any future context.

### Children and composition over prop-drilling flags

If you find yourself adding a third boolean prop to toggle rendering variants (`isCompact`, `showHeader`, `hideFooter`...), that's a signal the component should be split or composed via `children`/slots instead of configured via flags.

### Hooks: extract when logic is reused OR when a component's render body gets crowded with `useEffect`/`useState` bookkeeping that isn't about JSX

Don't extract a hook just to have a hook. A `useState` + a `useEffect` used by exactly one component, with no reuse on the horizon, can stay in the component. Extract to `features/<name>/hooks/` when: (a) two+ components need the same stateful logic, or (b) the logic is complex enough that pulling it out of the component clarifies what the component actually renders.

---

## 4. File & Folder Organization (feature-based, confirmed pattern)

Each `features/<name>/` folder may contain `components/`, `hooks/`, `api/`, `utils/` — only the subfolders a given feature actually needs, not all four by default. A feature's `index.ts` is its public barrel; nothing outside the feature imports from a path deeper than `features/<name>` directly.

```
features/
  salary-calculator/
    api/
      wageApi.ts          ← RTK Query endpoints for this feature
    components/
      SalaryForm.tsx
      SalaryFormStep.tsx
    hooks/
      useWageStats.ts      ← derives mean/Q1/Q3/min/max from query results
    index.ts                ← public barrel: export { SalaryForm } from './components/SalaryForm'
```

`shared/` is for code with no feature affinity — generic UI primitives, cross-feature types, formatting utils. If something is only used by one feature today, it starts inside that feature, not in `shared/`. Promote to `shared/` only when a second feature needs it — premature sharing creates coupling in the wrong direction.

---

## 5. Imports

- The `@/` path alias is configured (`tsconfig.app.json` `paths`, resolved at build/dev time via `vite-tsconfig-paths` in `vite.config.ts`). Use it from 2 levels of nesting onward (`../../hooks/useWageStats` → `@/features/.../hooks/useWageStats`). Relative imports (`./SalaryForm`) are reserved for direct siblings (1 level away) — `@/` is the default for anything beyond that, not just for escaping very deep chains.
- Import order: external packages → internal `@/` absolute imports → relative imports → type-only imports last within each group. ESLint can enforce this later with `eslint-plugin-import` if it becomes a recurring review comment; not installed yet, not necessary to add preemptively.
- Never import directly from another feature's internal folder (`features/auth/components/LoginForm.tsx` from outside `features/auth`) — always go through that feature's `index.ts` barrel.

---

## 6. Comments & Documentation

- Code comments in English (matches the product language decision).
- Comment _why_, not _what_ — `// recompute stats only when query data changes, not on every render` is useful; `// loop through records` is not.
- No commented-out code left in commits. If it's not needed, delete it — git history is the backup, not a comment block.

## 7. Git branching

-Strategy: Trunk-based development with short-lived feature branches. main is the stable branch; all work is either committed directly to main or goes through a short-lived feature branch that gets merged back into it.
-When to create a feature branch:
The change touches multiple files in a coordinated way (e.g., new infrastructure, cross-cutting refactors, or adding new dependencies).
The work-in-progress could break existing functionality.
The work might be abandoned, and we want to avoid polluting main.
Examples: feature/rtk-query-setup, feature/multi-step-form, feature/supabase-auth.

-When to commit directly to main: Configuration changes, documentation, a new isolated component that doesn't affect existing code, style tweaks, design tokens, or small, self-contained refactors within a single file or module.

-Branch Naming Conventions: Branches should describe the task being performed, not the folder being modified. For instance, a branch setting up RTK Query will touch app/store.ts, several features/\*/api/ folders, and shared/types.ts—yet it remains a single task: feature/rtk-query-setup. Never name a branch after a folder inside src/features/ (e.g., feature/salary-calculator is always incorrect). Doing so confuses the Git concept of a "feature branch" (a unit of work) with the project's concept of a "feature folder" (a business domain).

Handling Scope Creep / Unexpected Changes: If a large, unrelated change comes up midway through a feature branch (e.g., you realize you need to refactor AuthProvider before you can proceed), commit your current work-in-progress, switch back to main, resolve the prerequisite (either directly on main or in its own separate branch), go back to your feature branch, rebase or merge main into it, and resume your original task. Small, incidental changes to other domains (like adding a new type in shared or tweaking a provider's signature) can stay in the feature branch as separate commits with their own Conventional Commits messages.
