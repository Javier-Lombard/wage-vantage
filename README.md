# Wage Comparator

A multi-step salary comparator: users enter profile data (country, gender, education, occupation...) and get back salary statistics (mean, quartiles, min/max) visualized as charts, with optional multi-country comparison.

> **Status**: early scaffolding stage. Providers, store, and feature folders are in place; the calculator form, charts, and Supabase integration are not yet implemented.

## Stack

- **Vite + React 19 + TypeScript** (strict mode)
- **React Router v7** for routing
- **Tailwind CSS v4** for styling (CSS-first `@theme`, no `tailwind.config.js`)
- **Recharts** for data visualization
- **Redux Toolkit + RTK Query** for state management
- **Supabase** for auth and persistence (planned, not yet wired in)

## Getting started

```bash
npm install
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Project structure

Feature-based architecture — code is organized by business domain, not technical role:

```
src/
  app/          ← Store config + global providers (auth, theme)
  features/     ← Business domains (salary-calculator, comparison, auth, premium, export, templates)
  shared/       ← Components, hooks, lib, and types with no domain knowledge
  pages/        ← Route-level components that assemble features
```

Each feature owns its own components, hooks, RTK Query endpoints, and exposes a public API via `index.ts` — no cross-feature imports of internals.

## Documentation

Project conventions and decisions are documented for both contributors and AI coding assistants:

- [`CLAUDE.md`](./CLAUDE.md) — stack, conventions, and architecture summary (entry point)
- [`docs/architecture.md`](./docs/architecture.md) — folder structure, data flow, architectural decisions (ADR-lite)
- [`docs/conventions.md`](./docs/conventions.md) — TypeScript, naming, and component patterns
- [`docs/DESIGN.md`](./docs/DESIGN.md) — design system: color tokens, typography, spacing, component patterns

## Access model

- The calculator (form + chart) is publicly accessible without login.
- Premium-gated features (export, save template, extended country comparison) prompt a login/upsell flow for anonymous or free-tier users.

## Notes

- Final product language is English (UI text, identifiers, comments).
- This project is built on the default Vite React + TypeScript template. The React Compiler is not enabled (impacts dev/build performance) — see [the official docs](https://react.dev/learn/react-compiler/installation) if enabling it later. ESLint currently runs `typescript-eslint`'s `recommendedTypeChecked` config; see [`docs/conventions.md`](./docs/conventions.md) for the reasoning behind that choice.
