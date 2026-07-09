# Interface Segregation Principle in wage-comparator

> No caller should be forced to depend on a contract they do not use. Several small, focused interfaces are better than one large interface that bundles unrelated responsibilities. In React + TypeScript this applies to component props, hook return shapes, Redux selectors, and Context.

This file explains where ISP applies in this codebase specifically — what to segregate, what not to over-segregate, and how the project's existing structure already encodes ISP decisions.

## Why ISP earns attention here

ISP is often confused with SRP, but they answer different questions. SRP asks "does this unit have one reason to change?". ISP asks "does each caller of this unit only see the part they actually need?". A hook can satisfy SRP (one reason to change: derive access from the user record) while violating ISP (returns 12 capability flags when each caller uses one or two).

In a React codebase, the cost of ISP violations is concrete: components re-render when state they don't read changes, contracts grow harder to satisfy in tests, and developers add "yet another optional prop" to an interface that is already overloaded. The discipline of ISP is keeping the surface that each caller depends on as narrow as honestly possible.

## Where the project already applies ISP

### Context split (already in place)

`architecture.md` §2 documents two separate context families: `AuthContext` for authentication and `ThemeContext` for visual mode. Each lives in its own three-file split (`XContext.ts` + `XProvider.tsx` + `useX.ts`). The fact that these are two contexts and not one `AppContext` is ISP applied correctly: a component that only flips the theme does not need to depend on the auth surface, and vice versa.

If you ever find yourself tempted to "just put it all in one provider for convenience," remember that the convenience for the writer is paid for by every reader downstream — they now depend on a contract they did not need.

### `FieldShell`'s minimal contract

`FieldShell` exposes only the fields every labeled form control genuinely needs: `label`, `helperText`, `error`, `id`, and the `children` (the actual control). It does not bake in placeholder, value, onChange, or anything else that some controls use and others do not. Each control (`Input`, `Textarea`, `Select`) owns its own value-handling props independently.

This is ISP in interface design: the _common_ contract is small and shared; the _specific_ contract of each control is its own. A future control with a value shape that does not fit `Input`/`Textarea`/`Select` (e.g. a date picker with separate day/month/year values) can still use `FieldShell` for its label-and-error envelope without distorting the shell's interface.

## Where ISP needs care next

These are the spots most likely to grow ISP violations as features land.

### `useFeatureAccess` return shape

The OCP file shows the hook returning a flat object of capability flags. That shape is correct for OCP (new capability = one key on one file) but is also an ISP question once the object grows beyond a handful of entries.

There are two stances, both defensible, and the project should pick one consciously:

```tsx
// Stance A: one hook, callers destructure what they need
const { canExportPDF } = useFeatureAccess();
```

```tsx
// Stance B: targeted hooks, each computes one capability
const canExportPDF = useCanExportPDF();
```

Stance A is fine when the underlying derivation is cheap (a single `user.tier === 'premium'` check) and the object is small enough that the unused keys cost nothing meaningful. Stance B becomes correct when:

- The derivation gets expensive enough that recomputing all capabilities on every read is wasteful.
- Components start re-rendering for capability changes they do not consume.
- Tests for a component require mocking 12 flags when they care about 1.

`architecture.md` §3's preference for reversible structural choices suggests starting with Stance A and migrating specific capabilities to Stance B when one of the symptoms above shows up — not preemptively.

### Selectors on RTK slices

Redux Toolkit ships `createSlice` with a generated reducer, and the temptation is to write `useSelector((s) => s.wageForm)` and pull the entire slice into a component. ISP says no: each component should subscribe only to the leaves it reads.

```tsx
// Anti-pattern — component re-renders for any change in wageForm
const wageForm = useSelector((s) => s.wageForm);

// ISP-aligned — component subscribes only to the field it needs
const currentStep = useSelector((s) => s.wageForm.currentStep);
const selectedCountry = useSelector((s) => s.wageForm.values.country);
```

The benefit is not theoretical: with `useSelector`, React-Redux re-runs the equality check only on the selected slice. A component that selects the entire slice will re-render on every step change, every field change, every error change — even when it only cares about `currentStep`.

This is also a place where colocating selectors with the slice (or with a feature-level hook that wraps them) pays off, because the selector surface becomes a deliberate API instead of "whatever I happened to destructure in this component."

### Component props that grow into a god interface

A subtle ISP violation in React is when a component accepts a wide superset of props because different callers need different subsets. Every caller pays the cost of an interface most of which they do not satisfy:

```tsx
// Smell — different callers use disjoint subsets of this interface
interface SalaryCardProps {
  // Used by HomePage:
  value: number;
  country: string;
  // Used by ComparisonPage:
  values?: number[];
  countries?: string[];
  // Used by DashboardPage:
  isSaved?: boolean;
  templateId?: string;
  // Used by all:
  isPremium?: boolean;
}
```

Three callers using three disjoint subsets is three components, not one. ISP-aligned: split into `SalarySummaryCard`, `SalaryComparisonCard`, `SavedSalaryCard`. Each has a focused interface that its callers fully consume. This also tends to satisfy SRP and LSP at the same time, because the three components have three reasons to change and no false "substitution" is implied.

This is the same anti-pattern OCP warns about from a different angle (prop flags multiplying the contract); ISP names what is structurally wrong (the interface is broader than any single caller needs).

## A pattern to watch for: "shared types" that grow disjoint

`shared/types/` (per `architecture.md` §2) is the right home for cross-feature types. ISP risk: a single type grows fields that some features use and others ignore.

```tsx
// shared/types/wageRecord.ts
// Smell — half the fields exist only because one feature needed them
interface WageRecord {
  id: string;
  country: string;
  monthlyWage: number;
  // Used only by templates feature:
  templateId?: string;
  templateName?: string;
  // Used only by export feature:
  exportFormat?: 'pdf' | 'csv';
  exportedAt?: Date;
}
```

Two ISP-aligned fixes are available:

1. Keep `WageRecord` to the truly shared core, and let each feature define its own augmenting type that intersects with `WageRecord` for the fields it needs (`type SavedWageRecord = WageRecord & { templateId: string; ... }`).
2. Move feature-specific fields out of `shared/types/` and into the feature's own types file. `shared/types/` should only host fields that genuinely belong to all features.

The cost of getting this wrong is that every feature imports an interface promising fields it cannot actually rely on — TypeScript happily compiles, but the runtime contract is fictional.

## When NOT to segregate

ISP, like every SOLID principle, has a cost. Over-segregating creates a multitude of tiny interfaces that callers must compose tediously, and types that are technically precise but practically annoying to satisfy.

Indicators that segregation would be premature:

- The interface has 3–4 fields and every caller uses all of them. Splitting buys nothing.
- The interface has optional fields, but every caller realistically needs to know about most of them — `error` on `FieldShell` is optional, but a control that ignored it would be broken. The optionality is correct; segregating would be wrong.
- The "two callers" you would segregate for are speculative — only one exists today. `architecture.md` §3 applies: prefer the smaller, more reversible choice. Split when a second caller with a genuinely disjoint need appears.

When in doubt: keep the unified interface as long as all real callers use most of it, and segregate when actual divergence appears in real code, not in imagined future scenarios.

## What this file does NOT do

- It does not require every shared type to be split into single-field interfaces. Segregation is about meaningful caller-aligned chunks, not about minimizing every type to its smallest possible shape.
- It does not contradict the unified `useFeatureAccess` shape from the OCP file — both shapes (single hook, targeted hooks) are valid; this file documents how to decide between them.
- It does not require every `useSelector` call to select a single primitive. Selecting an object is fine when the component genuinely reads several fields together; the rule is "don't select more than you read."
- It does not introduce additional contexts or hooks proactively. Splitting `AuthContext` further (into `AuthSessionContext` and `AuthUserContext` and...) would be over-segregation; the existing split is already correct.

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
