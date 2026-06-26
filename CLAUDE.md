# Wage Comparator

## Stack

- Vite + React 19 + TypeScript (strict mode)
- React Router v7 for routing
- Tailwind CSS v4 for styling (via @tailwindcss/vite plugin, no postcss.config.js)
- Recharts for data visualization
- Motion (formerly Framer Motion) for animation — complements Tailwind, no imposed styles; see `docs/architecture.md` §5 for planned uses and phasing
- Lucide for icons
- Redux Toolkit + RTK Query for state management
- Supabase for auth and persistence
- Storybook (`@storybook/react-vite`) for isolated component development — see `docs/architecture.md` §6 for file placement conventions

## Design system

- Typography: Poppins (300/400/600/700).
- Primary accent: `#DFFF88`, used for CTAs, active states, and highlights.
- Dual-mode (light/dark) via plain CSS variables in `:root` / `.dark`, consumed by Tailwind v4's CSS-first `@theme` block in `src/index.css` — no `tailwind.config.js`.
- Dark mode is the primary design reference; light mode is a derived, coherent inversion with the same contrast proportions.
- 6-color palette (`chart-1` through `chart-6`) reserved for Recharts series, consistent across both modes.

Full design system and Tailwind `@theme` config: `docs/DESIGN.md`

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format (Prettier, writes in place): `npm run format`
- Check formatting without writing: `npm run format:check`
- Preview production build: `npm run preview`
- Storybook dev server: `npm run storybook` (port 6006)
- Build static Storybook: `npm run build-storybook`

## Conventions

- Named exports only, never default exports (exception: files a framework requires a default from, e.g. `vite.config.ts`).
- One component per file, file name matches component name.
- Context + Provider + hook is split across three files (`XContext.ts`, `XProvider.tsx`, `useX.ts`), never combined in one — combining breaks Vite Fast Refresh.
- `interface` for object shapes and component props (named `<ComponentName>Props`); `type` for closed unions, intersections, and function signatures.
- `verbatimModuleSyntax` is ON — type-only imports **must** use `import type`, or the build fails. Split mixed imports into a value import and a separate `import type`.
- No `any` (forbidden by convention even though not hard-banned by a lint rule) — prefer `unknown` + narrowing, or isolate untyped third-party returns behind one typed wrapper. Avoid `as` casting as a first resort.
- No TypeScript `enum` — use string unions for closed sets, or `as const` objects when a reverse lookup is needed.
- Naming: components `PascalCase.tsx`; hooks/utils/slices/api `camelCase.ts`; folders `kebab-case`; module constants `UPPER_SNAKE_CASE`; slices `<name>Slice`, RTK Query APIs `<name>Api`.
- The `@/` path alias (resolved via `vite-tsconfig-paths`) is configured for imports — use it from 2 levels of nesting onward (`../../`); keep relative imports (`./`) only for direct siblings (1 level away).
- Import order: external packages → `@/` absolute → relative → type-only last within each group.
- Comments in Spanish; comment _why_, not _what_. No commented-out code in commits.

Full conventions: `docs/conventions.md`

## Architecture

- Feature-based structure — `src/features/<domain>/`: one folder per business domain. Each feature owns its own slice, RTK Query endpoints (if any), components, and types. Public API via `index.ts`; no cross-feature imports of internals.
- `src/shared/` - components, hooks, lib (Supabase client), and types with no domain knowledge.
- `src/app/` - store configuration and global providers (theme, auth bootstrap).
- `src/pages/` - route-level components that are thin assemblers: wire feature barrels together with layout and handle route concerns (params, redirects). No business logic in a page file.
- Feature isolation: never import from another feature's internal folder — always go through its `index.ts` barrel, which re-exports only the public surface.
- Computed values (statistical derivations from salary data) live in hooks, not in components and not in Redux selectors — selectors stay simple (pick a slice), hooks compose and transform.
- SRP: every component, hook, and module has one reason to change. If it needs "and" to describe what it does, split it.
- SoC: components never import from @supabase/supabase-js or call fetch() directly — data access goes through RTK Query endpoints or hooks.
- DRY with restraint: extract shared abstractions only on the third occurrence, not the first. Premature abstraction is worse than duplication.
- `supabase/functions/` (repo root, outside `src/`) is reserved for Supabase Edge Functions — not yet implemented. Planned use: a server-side call to the Gemini (Google AI) API, kept off the client so the Gemini API key is never exposed in the browser. Expected in a later API-integration phase.

Full architecture, folder structure, and design decisions: `docs/architecture.md`

## Git workflow

- **Strategy**: trunk-based development with short-lived feature branches.
- **`main` is always stable** — small, contained changes go directly to `main`; no separate long-running branches.
- **Feature branches** (`feature/<task-description>`) are created when changes involve coordinated edits across multiple files, new dependency installations, or work that could be abandoned mid-way. Branch names describe the task, not the folder: `feature/rtk-query-setup`, never `feature/salary-calculator`.
- **No `develop`, `release/*`, or `hotfix/*` branches** — this is single-developer; those patterns add unnecessary overhead.
- **Mid-stream scope creep**: if a large unrelated change is discovered during a feature branch, commit work-in-progress, switch back to `main`, resolve the separate change, then resume the feature branch. This keeps the history clear and prevents one branch from growing too long.

## Commit reminders

- The user tends to forget to commit after medium or large changes. A `PostToolUse` hook in `.claude/hooks/` automatically triggers a reminder based on files modified since the last commit:
  - **1–2 files**: no reminder.
  - **3–5 files**: single reminder (medium change).
  - **6+ files, or any modification to `package.json` / `package-lock.json`**: more insistent reminder (large change, high risk of loss if uncommitted).
- Claude Code does not need to track this threshold actively turn-by-turn; the hook is the mechanism that triggers the reminder. This section documents the criteria so it's clear why the reminder appears when it does.
- **Prettier formatting is mandatory before commit.** A `PreToolUse` hook (`.claude/hooks/check-before-commit.js`) gates every `git commit`: it runs `prettier --check .` first, and unlike the `tsc`/`eslint` checks in the same hook (which block the commit on failure), a formatting mismatch is auto-fixed — it runs `prettier --write .`, re-stages the affected files, and lets the commit proceed. `tsc`/`eslint` errors still block the commit with no auto-fix. Run `npm run format` manually any time to format on demand without committing.

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

- Final product language is English (UI text and identifiers). This does not extend to `.claude/commands/` or commit messages — those are written in Spanish, the language used to communicate with the assistant in these sessions. See `.claude/commands/commit.md` for the commit message language rule.
