# Wage Comparator

## Stack
- Vite + React 19 + TypeScript (strict mode)
- React Router v7 for routing
- Tailwind CSS v4 for styling (via @tailwindcss/vite plugin, no postcss.config.js)
- Recharts for data visualization
- Redux Toolkit + RTK Query for state management
- Supabase for auth and persistence

## Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Conventions
- Named exports only, never default exports
- Functional components only, no class components
- One component per file, file name matches component name

## Project structure
- `src/features/<domain>/` - one folder per business domain. Each feature owns its own slice, RTK Query endpoints (if any), components, and types. Public API via `index.ts`; no cross-feature imports of internals.
- `src/shared/` - components, hooks, lib (Supabase client), and types with no domain knowledge.
- `src/app/` - store configuration and global providers (theme, auth bootstrap).
- `src/pages/` - route-level components that assemble features.

## State management
- Server state: RTK Query (one `createApi` per feature under `features/<name>/api/`).
- Client state: Redux Toolkit slices, one per feature when needed.
- Theme (light/dark): React Context, not Redux.
- Form-in-progress and theme preference: sessionStorage / localStorage via dedicated hooks in `src/shared/hooks/`.
- User-saved data (templates, comparisons): Supabase only, no local mirror.
- Do not use redux-persist to mirror the entire store; persist selectively and explicitly.

## Auth and access control
- Calculator (form + chart) is publicly accessible without login.
- Premium-gated features (export, save template, extended country comparison) trigger a login/upsell flow when used by anonymous or free-tier users.
- Premium gating is centralized in `src/features/premium/` (PremiumGate component, useFeatureAccess hook, config.ts).

## Notes
- Final product language is English (UI text, identifiers, comments).
