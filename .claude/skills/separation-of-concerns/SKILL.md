---
name: separation-of-concerns
description: Layer-and-location discipline for this feature-based React/Tailwind/RTK codebase. Use before deciding where a new file lives (`shared/`, `features/<name>/`, or `app/providers/`), before a component mixes presentation/state/data-access, or before deciding if a value is an `index.css` token vs. a Tailwind class. Same complexity threshold as `solid-principles` (skip trivial `shared/components/ui/` additions). Distinction: this skill is about WHERE code lives and WHICH layer it belongs to; `solid-principles` is about HOW a unit is structured once its layer is decided. "One component or three" is SOLID; "shared/ vs. feature, token vs. Tailwind class" is this skill. Defers to docs/architecture.md and docs/conventions.md as authoritative.
---

# Separation of Concerns for wage-comparator

This skill applies Separation of Concerns to layer placement and code-type separation in this codebase: where a file lives, which of the three cardinal locations owns a piece of logic, and how presentation, state, and data access stay apart in components built on Tailwind v4 + RTK Query.

It does **not** restate generic SoC theory. It encodes the specific judgement calls this project already makes about layering — most of which `architecture.md` §2 and §4 have already pre-decided. The job of this skill is to apply those decisions consistently, not to re-derive them per file.

## Authoritative sources

- `docs/architecture.md` — §2 folder structure and the three cardinal locations, §4 data flow, §5 ADRs
- `docs/conventions.md` — §3 component patterns (three-file context split), §4–§5 file organization and barrels
- `docs/DESIGN.md` — design tokens (§1 color, §3 spacing) vs. Tailwind utility usage in JSX

When this skill and one of those documents disagree on a specific rule, **the document wins**.

## Why SoC matters here specifically

This is not an abstract concern. Three concrete failure modes show up repeatedly in a feature-based + Tailwind v4 + RTK Query stack if SoC is skipped:

1. **Wrong-layer placement causes false coupling.** A hook written inside `features/salary-calculator/hooks/` that actually has no salary-domain knowledge (e.g. a generic `useDebouncedValue`) silently locks every other feature that needs it into importing through the salary-calculator barrel, or — worse — encourages a second, slightly different copy in another feature.
2. **Mixed-layer components can't be tested or swapped independently.** A component that fetches via raw Supabase calls, computes a derived statistic, and renders a chart in one body (architecture.md §4's anti-pattern) means a Supabase response shape change, a stats bug fix, and a Recharts prop tweak all touch the same file and the same mental model.
3. **Token/utility confusion breaks the dark/light single-source-of-truth design.** This project deliberately put color and spacing values in CSS variables (`index.css` `:root`/`.dark`) consumed via Tailwind v4's `@theme`, specifically so zero `dark:` prefixes are needed in component code (architecture.md §5 ADR). Hardcoding a hex value or an ad hoc spacing number directly in a `className` string — instead of using the token-backed utility — defeats that ADR the first time someone forgets to update it in both modes.

## The three cardinal locations: deciding where a file goes

`architecture.md` §2 already defines three locations. The recurring judgement call is not "do these locations exist" but "which one does *this specific file* belong in." Concrete criteria, not generic ones:

| Location | Decide it belongs here when... | Reference |
|---|---|---|
| `src/features/<name>/` | The code embeds domain knowledge specific to one business domain — it reads or shapes data tied to salary calculation, comparison, auth, premium tiers, export, or templates. Default starting point for anything new. | `architecture.md` §2, §4 |
| `src/shared/` | A **second, unrelated feature** already needs the exact same code with zero domain-specific branching. Not "might need" — needs, today. | `architecture.md` §2: "Promotion to `shared/`... only when a second, unrelated feature needs the same thing" |
| `src/app/providers/` | The code is global application infrastructure that every feature depends on implicitly (auth session, theme) rather than something any one feature owns — and it follows the three-file Context split. | `architecture.md` §2; `conventions.md` §3 |

The default direction of travel is **feature → shared**, never the reverse as a starting guess. If you are creating a new file and unsure, put it inside the feature that needs it first. Moving it to `shared/` later is cheap (it's a relocation + barrel update); guessing `shared/` upfront and being wrong creates an abstraction nobody asked for.

A second test for `shared/` vs. `app/providers/`: does this thing have **render output and reusable UI/logic** (→ `shared/components` or `shared/hooks`), or does it **provide ambient context that wraps the whole app once** (→ `app/providers/`)? `ThemeProvider` and `AuthProvider` each wrap the app exactly once near the root; a `Modal` or `useMediaQuery` gets used many times across many trees. If a provider-shaped thing is actually feature-scoped (e.g. a hypothetical `ComparisonSessionProvider` only used inside the comparison flow), it does not belong in `app/providers/` — it stays inside `features/comparison/`, because `app/providers/` is reserved for truly global, cross-cutting infrastructure.

## Separating presentation, state, and data: the data-flow seam

`architecture.md` §4 already specifies the data flow:

```
Component dispatches/triggers → RTK Query / slice → hook derives computed values → Component renders → Recharts
```

This pins down three separable concerns and where each lives:

- **Data access** — exclusively RTK Query endpoints in `features/<name>/api/`. Never a raw Supabase client call inside a component or a custom hook outside `api/`. Never `useEffect` for fetching.
- **Derivation/computation** — hooks in `features/<name>/hooks/`. Statistical derivations (mean, Q1, Q3, min, max) live here, not in the component and not in a Redux selector. Selectors stay simple (pick a slice); hooks compose and transform.
- **Presentation** — the component itself: JSX, ARIA, event wiring, passing already-computed props to Recharts or to a form field shell. A component should not recompute a statistic inline just because the raw query data was already in scope.

This is a SoC seam, distinct from the SOLID question of whether the component itself is internally well-structured (that's `solid-principles`' `single-responsibility.md`). SoC asks "is this logic in the right *kind* of file"; SOLID asks "is this *one file* doing one job."

## Visual/logic/data separation in this stack specifically

Because styling here is Tailwind v4 CSS-first (no `tailwind.config.js`, tokens defined once in `index.css`'s `@theme` block per `DESIGN.md` §1 and the architecture ADR in §5), the SoC question for any visual value is:

- **Does this value encode a design decision that must stay consistent across dark/light and across the whole app** (a brand color, a spacing step, a type-scale size)? → It is a **token** in `index.css`, consumed as a Tailwind utility class (`bg-surface`, `text-muted`, `p-4`). Never hardcode the underlying hex or px value in a component.
- **Is this a one-off layout decision specific to this component's structure** (a grid-template-columns value for this exact layout, a max-width for this exact card)? → It can be a Tailwind utility directly in JSX, because it's not a reusable design decision — it's local layout logic.

The same separation applies to animation: Motion is installed specifically because it has "no opinion on visual style, it only animates props/layout" (`architecture.md` §5 ADR) — Motion code describes *behavior* (when something enters/exits, how it transitions), Tailwind classes describe *appearance* (color, spacing, typography). A component mixing the two concerns in one undifferentiated blob of conditional class strings and inline animation values is harder to evolve than one where `motion.div`'s `variants`/`transition` props own timing/movement and `className` owns static appearance.

## Worked example: a page mixing all three concerns

Take a hypothetical `MainForm` — the salary-calculator's entry page, rendering the multi-step form and a live-updating preview chart. The naive version collapses layering across all three cardinal locations and all three data-flow seams:

```tsx
// Anti-pattern: wrong layer + mixed concerns, all in one feature component
export function MainForm() {
  // Data access inlined — should be features/salary-calculator/api/wageApi.ts
  const [records, setRecords] = useState<WageRecord[]>([]);
  useEffect(() => {
    supabase.from('wages').select('*').then(({ data }) => setRecords(data ?? []));
  }, []);

  // Derivation inlined — should be features/salary-calculator/hooks/useWageStats.ts
  const mean = records.reduce((sum, r) => sum + r.monthlyWage, 0) / records.length;

  // Hardcoded design values instead of tokens — should be Tailwind utilities backed by @theme
  return (
    <div style={{ backgroundColor: '#1A1F27', padding: '24px' }}>
      <SalaryFormStep />
      <p style={{ color: '#8A95A3' }}>Average: {mean}</p>
    </div>
  );
}
```

Three separable concerns collapsed into one file, each belonging to a different layer:

- **Data access** moves to `features/salary-calculator/api/wageApi.ts` as a `useGetWagesQuery()` RTK Query endpoint — the only place that talks to Supabase.
- **Derivation** moves to `features/salary-calculator/hooks/useWageStats.ts`, consuming the query result and returning `{ mean, q1, q3, min, max }`.
- **Visual values** move to token-backed Tailwind utilities (`bg-surface p-6`, `text-muted`) instead of inline hex/px — so dark/light mode and any future palette tweak update in one place (`index.css`), not per-component.

`MainForm` itself shrinks to composing `SalaryFormStep`, calling the hook, and rendering with token-backed classes — its only remaining responsibility is presentation wiring, exactly as `architecture.md` §4's data flow diagram describes.

## When NOT to over-separate

SoC, like SOLID, can be over-applied. `architecture.md` §3 explicitly prefers the smaller, more reversible structural choice over a forced split. Signals that a separation is premature:

- Splitting a 15-line component into a hook + a component when the "logic" being extracted is a single derived boolean used nowhere else. That's indirection, not separation.
- Promoting something to `shared/` on the *first* use "in case another feature needs it later" — `architecture.md` §2 is explicit that promotion happens on the second real, unrelated usage, not speculatively.
- Creating a new `app/providers/` entry for state that's actually scoped to one feature's flow. Global infrastructure and feature-scoped session state are not the same thing even if both feel "contextual."
- Extracting a Tailwind utility's underlying value into a one-off CSS variable because "it might need theming later," when no second mode or second usage exists yet. Tokens already cover the design system's variable parts (`DESIGN.md` §1) — don't invent parallel ad hoc tokens for things Tailwind utilities already express plainly.

When in doubt, leave the code where it is and revisit after a second real case appears, per the same reversibility principle `solid-principles` already applies to hook extraction.

## What this file does NOT do

- It does not re-litigate which folders exist — `architecture.md` §2 is the source of truth for the folder tree itself.
- It does not define new design tokens or propose changes to the palette — that's `DESIGN.md`'s job.
- It does not cover internal structuring of a single component/hook/slice once its layer is decided — that is `solid-principles` (see its `single-responsibility.md` in particular for the data-access/derivation/presentation split *within* an already-feature-scoped unit).
- It does not require a dedicated hook for every derived value — `conventions.md` §3's extraction threshold (two+ consumers, or render-body clutter) still governs whether something becomes its own hook file at all.
- It does not mandate `eslint-plugin-boundaries` or any tooling enforcement — feature isolation here is convention-based by design (`architecture.md` §2), and that is documented as a deliberate, revisitable choice, not a gap to silently "fix."

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
