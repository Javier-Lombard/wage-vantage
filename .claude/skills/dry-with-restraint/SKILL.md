---
name: dry-with-restraint
description: Rule-of-three duplication discipline for this feature-based React/RTK codebase. Use before any new file in `src/features/<name>/` (components, hooks, api, utils), any new custom hook, RTK slice, or endpoint, any component with fetch/form-state/conditional rendering, and any decision to extract a hook or shared component out of duplicated logic. Skip trivial `shared/components/ui/` additions. Distinction: `solid-principles` checks a unit's internal split; `separation-of-concerns` checks which layer code belongs to; this skill checks whether near-identical logic already exists and whether *now* (third occurrence) is the moment to collapse it. Defers to docs/architecture.md and docs/conventions.md as authoritative.
---

# DRY with Restraint for wage-comparator

This skill applies "Don't Repeat Yourself" under the specific restraint this project has already chosen: the **rule of three** (`architecture.md` §3) — don't abstract on the first duplication, and often not on the second either. It governs the decision of _when_ to collapse duplicated logic into a shared component, hook, util, or endpoint, and — just as often — when to leave the duplication alone.

It does **not** restate generic DRY theory. Generic DRY advice optimizes for zero repetition; this project deliberately does not, because premature abstraction has a worse failure mode here than duplication does (see "Why restraint, not just DRY" below).

## Authoritative source

`architecture.md` §3 states the rule directly: _"DRY with restraint (rule of three — don't abstract on first duplication)"_, and frames it alongside SOLID and Separation of Concerns as one of three design principles deliberately kept out of the architecture doc's body and pushed into dedicated skills, "so they stay current and don't bloat this file's context cost every session."

`conventions.md` reinforces the same restraint at the hook level (§3): _"Hooks: extract when logic is reused OR when a component's render body gets crowded... Don't extract a hook just to have a hook."_ And at the folder level (§4): _"If something is only used by one feature today, it starts inside that feature, not in `shared/`. Promote to `shared/` only when a second feature needs it."_

Note the asymmetry between these two sources: `conventions.md` §3's hook-extraction threshold is **two** occurrences ("two+ components need the same stateful logic"); `architecture.md` §3's rule of three is **three**. These are not in conflict — they answer different questions. "Should this become its own hook _at all_" (extraction within a feature) tolerates two. "Should this become a _cross-feature, shared_ abstraction" (promotion to `shared/`) waits for three. When in doubt about which threshold applies, ask whether the candidate abstraction stays inside one feature (two is enough) or crosses into `shared/` (wait for three).

## Why restraint, not just DRY

Generic DRY treats every duplication as a future bug waiting to happen. This project's `architecture.md` §3 takes the opposite default risk assessment: a wrong abstraction is more expensive to undo than a duplicated 10 lines is to maintain. Three concrete reasons this holds in this specific stack:

1. **Two similar-looking things are often not the same thing yet.** A `SalaryFormStep` and a `ComparisonFormStep` might both render a labeled input row today, but if their validation, layout, and future evolution diverge (one gains premium-gating, the other doesn't), an early shared `FormStep` component becomes a component with branching internal logic for two unrelated callers — which is the SRP failure mode `solid-principles` already warns about, just arrived at via DRY instead of avoided by it.
2. **Premature `shared/` promotion creates false coupling**, the exact failure `separation-of-concerns` names directly: once a second feature imports a "shared" hook that was really only ever exercised by one feature's needs, every future change to that hook has to satisfy two callers' divergent assumptions instead of one.
3. **The cost of waiting is just a relocation.** Leaving two similar 15-line blocks alone for now and promoting them to `shared/` once a third caller appears costs one file move plus a barrel update. Abstracting after one duplication and being wrong costs an unwind — at least one wrong call site, and possibly a parameter explosion as it tries to handle cases it was never really designed for.

## The rule of three, applied to this codebase's seams

`architecture.md` §2's folder structure pre-defines where the "third occurrence" question gets asked:

- **Inside one feature** (`features/<name>/components/`, `hooks/`, `utils/`): the relevant threshold is `conventions.md` §3 — extract on the **second** real consumer, or when one component's render body is crowded enough that pulling the logic out clarifies what's left. This is a within-feature move, not a `shared/` promotion, so it's cheaper and the bar is lower.
- **Across features** (something in `features/salary-calculator/` looks like something in `features/comparison/`): this is where the **rule of three** applies at full strength. Two features doing something similar is exactly the "two unrelated features, coincidentally similar code" case `architecture.md` §2 warns about — wait for a third instance, or for the first two to prove their similarity is structural (not coincidental) before promoting anything to `shared/`.
- **RTK Query endpoints and slices**: a query pattern repeated across two `api/` files (e.g. two features each paginating a Supabase table slightly differently) is not yet grounds for a shared abstraction — RTK Query's own `createApi` already provides reuse primitives (shared `baseQuery`, `tagTypes`) without forcing a custom wrapper. Reach for those before inventing a project-specific abstraction layer.
- **Visual/JSX duplication**: two components rendering a similar-looking row of label + value is not automatically a new shared atom — check first whether `shared/components/ui/` already has a primitive (`FieldShell`, etc.) that covers it via composition, before writing a new one. Promoting visual duplication to `shared/` follows the same "second unrelated feature, or third occurrence" logic as any other code.

## Worked example: when duplication looks like a hook but isn't (yet)

Take a hypothetical situation: `features/salary-calculator/hooks/useWageStats.ts` computes `{ mean, q1, q3, min, max }` from an array of `WageRecord`. Later, `features/comparison/` needs a similar set of summary statistics for a second country's dataset to render side-by-side in a chart.

The DRY-without-restraint move is to immediately extract a generic `useStats<T>(records: T[], key: keyof T)` into `shared/hooks/` the moment the second feature's need appears:

```ts
// Premature — extracted on the *second* occurrence, across features
// shared/hooks/useStats.ts
export function useStats<T>(records: T[], key: keyof T) {
  const values = records.map((r) => Number(r[key]));
  // mean / q1 / q3 / min / max...
}
```

This looks reasonable, but it's exactly the case `architecture.md` §3 says to resist: two occurrences, one of which (`comparison`) might soon need country-specific weighting or currency normalization that `salary-calculator`'s version never needed — at which point `useStats` either grows a branching parameter (an SRP smell, per `solid-principles`) or comparison forks its own copy anyway and the shared hook becomes dead weight.

The rule-of-three-compliant move: leave `useWageStats` inside `features/salary-calculator/hooks/`, and let `features/comparison/hooks/` write its own `useComparisonStats` — even though the body looks 80% identical right now. Promote to `shared/hooks/useStats.ts` only once a **third** consumer needs the same computation with no feature-specific branching, at which point the shared shape can be derived from three real call sites instead of guessed from two.

## When restraint itself goes too far

Restraint is not an excuse to never abstract. Signals that duplication has outlived its restraint budget and should now be collapsed:

- **A third real occurrence has appeared**, with no feature-specific divergence between the three — at this point, _not_ abstracting is the violation, not the caution.
- **A bug fix had to be applied in more than one place** because the same logic was copied, and the copies have already drifted in a way that caused (or nearly caused) an inconsistency bug. That is the rule of three's underlying risk materializing, not a hypothetical.
- **The duplicated block is large enough that "is this still the same logic" is itself hard to verify by eye** — at that size, the cost of carrying the duplication (review burden, risk of silent drift) can exceed the cost of a shared abstraction even before three occurrences, per `architecture.md` §3's own framing of preferring the more reversible choice, which sometimes is the abstraction, not the duplication.

## What this file does NOT do

- It does not lower `conventions.md` §3's two-occurrence threshold for intra-feature hook extraction — that threshold is unaffected by the rule of three, which governs cross-feature/`shared/` promotion specifically.
- It does not define line-count or block-size limits as a trigger for extraction (none exist in this project) — see `solid-principles`' `single-responsibility.md` for why line counts are rejected as a smell-detector here too.
- It does not mandate a specific abstraction shape (generic function, HOC, render prop, etc.) once the third-occurrence bar is met — that is a SOLID/Separation-of-Concerns question (`solid-principles`, `separation-of-concerns`), not a DRY one.
- It does not apply to design tokens — `DESIGN.md` §1's token system already centralizes color/spacing values by design from the start; that is not "duplication avoided by restraint," it's a single source of truth that never had a first occurrence to count.
- It does not contradict barrel exports or feature isolation — collapsing duplication across features still goes through `shared/`'s public surface and feature barrels (`conventions.md` §4–§5), never a direct cross-feature import as a shortcut.

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
