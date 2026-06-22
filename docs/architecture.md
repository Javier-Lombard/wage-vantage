# Architecture — Wage Comparator

---

## 1. Architectural Pattern: Feature-Based (Domain-Driven)

This project follows a **feature-based architecture** where code is organized by business domain, not by technical role. Each feature is a self-contained vertical slice: it owns its own components, hooks, API layer, types, and (when needed) Redux slice. Features communicate with each other exclusively through their public barrel (`index.ts`), never by reaching into another feature's internal folders.

Why this pattern (and not a flat `components/` + `hooks/` + `services/` layout):
- **Locality of change**: when a feature evolves, everything that needs to change lives in one place.
- **Explicit boundaries**: the barrel makes it impossible to accidentally couple features at the import level.
- **Scalability**: adding a new feature means adding a new folder, not scattering files across six directories.

---

## 2. Folder Structure

```
src/
  app/                          ← Application shell (global, framework-level)
    providers/                  ← Global context providers
      AuthContext.ts            ← createContext + context type only
      AuthProvider.tsx          ← Provider component (named export)
      useAuth.ts                ← Consumer hook (throws if outside provider)
      ThemeContext.ts
      ThemeProvider.tsx
      useTheme.ts
    store.ts                    ← Redux store configuration (configureStore)

  features/                     ← Business domains (the core of the app)
    salary-calculator/          ← Primary feature: multi-step form + salary data
      api/                      ← RTK Query endpoints (one createApi per feature)
      components/               ← UI components (PascalCase.tsx)
      hooks/                    ← Feature-specific hooks (camelCase.ts)
      index.ts                  ← Public barrel — ONLY re-exports the public API
    comparison/                 ← Multi-country comparison modal + charts
      components/
      index.ts
    auth/                       ← Login, registration, session management
      api/
      components/
      index.ts
    premium/                    ← PremiumGate component, useFeatureAccess hook, tier config
      components/
      hooks/
      index.ts
    export/                     ← PDF/CSV export of salary data
      components/
      utils/
      index.ts
    templates/                  ← Saved comparison templates (premium feature)
      api/
      components/
      index.ts

  shared/                       ← Code with NO domain affinity
    components/                 ← Generic UI primitives (Button, Modal, Select...)
    hooks/                      ← Cross-feature hooks (useLocalStorage, useMediaQuery...)
    lib/                        ← External service clients (Supabase client init)
    types/                      ← Cross-feature TypeScript types

  pages/                        ← Route-level components (assemble features into pages)

  main.tsx                      ← Entry point (providers + router wrapping)
  App.tsx                       ← Root component (router outlet)
  index.css                     ← Tailwind @import + @theme + base styles
```

### Key structural rules

**Feature isolation**: nothing outside `features/salary-calculator/` imports from `features/salary-calculator/components/SalaryForm.tsx` directly — it imports from `features/salary-calculator` (the barrel). This is enforced by convention, not by tooling (yet — `eslint-plugin-boundaries` is a documented future option in `docs/conventions.md` if violations start occurring).

**Promotion to `shared/`**: code starts inside its feature. It moves to `shared/` only when a second, unrelated feature needs the same thing. Premature promotion creates false coupling.

**Providers live in `app/providers/`**: they are global infrastructure, not features. Each context follows a strict three-file split (`XContext.ts` + `XProvider.tsx` + `useX.ts`) to satisfy Vite Fast Refresh constraints — see `docs/conventions.md` §3 for the rationale.

**Pages are thin assemblers**: a page component in `pages/` imports from feature barrels, wires them together with layout, and handles route-level concerns (params, redirects). No business logic lives in a page file.

---

## 3. Design Principles (summary — detail lives in skills)

This codebase follows **SOLID** (adapted for React/TS), **Separation of Concerns**, and **DRY with restraint** (rule of three — don't abstract on first duplication). These are not explained in depth here on purpose: detailed guidance, examples, and enforcement for each principle live in dedicated `.claude/skills/` entries, so they stay current and don't bloat this file's context cost every session.

If a skill for a given principle doesn't exist yet, default to the standard, well-known definition of that principle and apply it conservatively — prefer the smaller, more reversible structural choice over a larger refactor.

---

## 4. Data Flow

```
User interaction (form select, button click)
  → Component dispatches action or triggers RTK Query hook
    → RTK Query fetches from Supabase (or Redux slice updates local state)
      → Hook derives computed values (mean, Q1, Q3, min, max)
        → Component re-renders with new data via selector/hook return
          → Recharts receives formatted data as props and renders the chart
```

Key constraints:
- Data flows **down** (props) and **out** (callbacks/dispatch). No child component reaches up to modify a parent's state directly.
- Supabase is accessed **exclusively** through RTK Query endpoints, never through raw client calls in components or hooks.
- Computed values (statistical calculations from salary data) are derived in hooks, not in components and not in Redux selectors — selectors stay simple (pick a slice of state), hooks compose and transform.

---

## 5. Architectural Decisions (ADR-lite)

Decisions already made, with reasoning preserved to prevent re-litigation:

| Decision | Chosen | Over | Why |
|---|---|---|---|
| State management | RTK + RTK Query | Zustand + TanStack Query | Portfolio differentiation — Zustand/TanStack already known, RTK demonstrates a different paradigm |
| Backend | Supabase | Custom API | Auth + DB + real-time in one service; row-level security; generous free tier |
| Styling | Tailwind v4 CSS-first | CSS Modules, styled-components | Utility-first reduces context switching; v4's `@theme` maps directly to design tokens; no runtime cost |
| Project structure | Feature-based | Flat by-role | Locality of change, explicit boundaries (see §1 above) |
| Theme state | React Context | Redux | Theme has no cross-feature derived state — Context is simpler and avoids Redux boilerplate for a single boolean |
| Store persistence | Selective (localStorage/sessionStorage via hooks) | redux-persist | Full-store mirroring is overkill; explicit persistence per value is more predictable and debuggable |
| Dark/light mode | CSS variables in :root/.dark + Tailwind @theme | Tailwind dark: prefix on every utility | Token-driven swap means zero dark: prefixes in component code — single source of truth in index.css |
