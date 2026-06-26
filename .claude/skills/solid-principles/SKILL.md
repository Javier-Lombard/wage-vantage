---
name: solid-principles
description: SOLID principles adapted for React 19 + TypeScript + RTK + RTK Query, applied to this codebase's feature-based architecture. This skill should be used before writing or substantially modifying any non-trivial component, hook, slice, or endpoint — specifically: any new file inside `src/features/<name>/` (components, hooks, api, utils), any new custom hook anywhere in the codebase, any new RTK slice or RTK Query endpoint, any component that fetches data or owns form state, any component with more than ~3 props or visible conditional rendering, and any decision about splitting one component into several or extracting a hook from a render body. This skill should NOT be used for purely additive changes to atoms in `src/shared/components/ui/` (e.g. adding a new variant to Button, a new color to Badge, a new icon to Icon) — those are too small to warrant SOLID review and would only burn context. Defers to docs/architecture.md and docs/conventions.md as authoritative — this skill operationalizes those documents, it never overrides them.
---

# SOLID Principles for wage-comparator

This skill applies the five SOLID principles to React 19 components, custom hooks, RTK slices, and RTK Query endpoints in this codebase.

It does **not** restate generic SOLID theory — that's available everywhere. It does encode the specific judgement calls this project makes when applying SOLID under tension (composition vs. props flags, hook extraction thresholds, feature isolation, abstraction restraint).

## Authoritative sources

This skill is built on top of three documents that must be consulted when making structural decisions:

- `docs/architecture.md` — feature-based layout, ADRs, data flow rules
- `docs/conventions.md` — TypeScript settings, naming, component patterns, file organization
- `docs/DESIGN.md` — design tokens and component visual patterns (relevant when SRP discussions touch presentation vs. logic)

When this skill and one of those documents disagree on a specific rule, **the document wins**. This skill is a reading aid, not a substitute.

## The five principles, mapped to this codebase

Each principle has its own reference file in `references/`. Read only the one(s) relevant to the current task — they are not all needed at once.

| Principle | Reference file | Read when |
|---|---|---|
| Single Responsibility | `references/single-responsibility.md` | Splitting a component, deciding hook extraction, organizing a feature folder |
| Open–Closed | `references/open-closed.md` | Designing variant systems (Button, Badge), planning extension points, debating prop flags vs. composition |
| Liskov Substitution | `references/liskov-substitution.md` | Designing interchangeable components behind a shared interface (FieldShell-wrapped controls, swappable export formats) |
| Interface Segregation | `references/interface-segregation.md` | Designing component props, splitting Context, slicing RTK selectors |
| Dependency Inversion | `references/dependency-inversion.md` | Wiring RTK Query, Supabase access, integrating external services, designing testable hooks |

## Hard rules this skill enforces

These come from `docs/conventions.md` and are restated here only because they are SOLID-relevant and frequently misapplied by generic React advice:

- **No barrel exports are forbidden** — feature `index.ts` barrels are mandatory in this project (`conventions.md` §4, §5). Generic SOLID advice often bans barrel re-exports; that advice does not apply here.
- **Hooks are not extracted on first repetition** — `conventions.md` §3 explicitly says to extract a hook only when two+ components need it, or when render logic is crowded. Premature extraction violates DRY-with-restraint (`architecture.md` §3).
- **State management is RTK + RTK Query, not TanStack Query / Zustand** — `architecture.md` §5 ADR. Any SOLID example involving data fetching must use RTK Query patterns.
- **Components use named exports, props are `interface ComponentNameProps`** — `conventions.md` §3. SOLID examples must follow this.
- **No `useEffect` for data fetching** — RTK Query handles it. SRP for components means the fetch lives in a hook or endpoint, not in `useEffect`.

## Anti-patterns this skill rejects

These are rules from generic SOLID-for-React material that conflict with this project's documentation:

- ❌ "Files < 100 lines, components < 50, hooks < 30" (hard line limits) — `architecture.md` §3 prefers reversible structural choices over forced fragmentation. Line counts are a smell, not a verdict.
- ❌ "JSDoc mandatory on every export" — `conventions.md` §6 says comment *why, not what*. JSDoc on trivial exports is noise.
- ❌ "Interfaces in `src/interfaces/`" — this project keeps prop interfaces inline with their component (`conventions.md` §3) and cross-feature types in `shared/types/` (`architecture.md` §2).
- ❌ "Ban `any`, enforce strict-type-checked" — `conventions.md` §1 documents the deliberate choice to stay at `recommendedTypeChecked`. `any` is forbidden by convention, not by lint rule, and that distinction is intentional.

## When to invoke a reference file vs. answer inline

For quick judgement calls ("does this hook belong in `salary-calculator` or `shared`?"), the rules in this `SKILL.md` plus the linked docs are usually enough.

Open a specific `references/<principle>.md` only when the current task genuinely turns on that principle — for example, "should this be one Context or three" is an Interface Segregation question; "how do I expose RTK Query to a hook for testing" is a Dependency Inversion question.

Reading all five reference files at once is rarely needed and defeats the point of progressive disclosure.
