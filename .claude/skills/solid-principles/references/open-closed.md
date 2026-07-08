# Open–Closed Principle in wage-comparator

> A unit should be open to extension but closed to modification. In a React + TypeScript codebase this means: when a new case appears (a new variant, a new step, a new tier, a new export format), the existing code should accept it without being rewritten.

This file explains how OCP applies to the specific extension points this project already has or will have. It does not restate the principle in the abstract.

## Why OCP matters more than it looks

Most React advice frames OCP as a niche concern — "use composition over modification" — and moves on. In a feature-based codebase with a multi-step form, premium tiers, multiple chart types, and pluggable export formats, OCP is actually one of the busiest principles, because nearly every feature in this project's roadmap involves a "things grow" axis:

- **Variants grow.** Button starts with three; later it may need a `link`-style variant.
- **Form steps grow.** The cascading select chain may gain new fields when Supabase tables get new dimensions.
- **Premium tiers grow.** Today there are two (free / premium); a third (`pro`) is plausible.
- **Export formats grow.** PDF and CSV today; XLSX or shareable URL tomorrow.
- **Chart types grow.** Single-country chart now; multi-country comparison later.

If each growth path forces you to edit a central file every time a new case appears, the central file becomes a bottleneck and a source of regressions. The discipline of OCP is making each growth path land in a new file, not in a changed one.

## Where the project already applies OCP (and how to read it)

`Button.tsx` is a small but clean example. Its variant system is a closed contract for the data ("which visual styles exist") but open for extension ("add an entry to the record, get a new variant for free"):

```tsx
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  outline: 'border border-primary text-primary hover:bg-primary-muted',
  ghost: 'text-muted hover:bg-surface-hover',
};
```

Adding a fourth variant means: extend the `ButtonVariant` union and add one entry to the record. The render body of `Button` does not change — it indexes the record by the variant prop. OCP holds.

Compare this to the anti-pattern that would break OCP:

```tsx
// Anti-pattern: OCP broken — render body grows for every new variant
return (
  <button
    className={cn(
      BASE_CLASSES,
      variant === 'primary' && 'bg-primary text-on-primary',
      variant === 'outline' && 'border border-primary text-primary',
      variant === 'ghost' && 'text-muted hover:bg-surface-hover',
      // ↑ every new variant adds a new line right here, in the same render body
    )}
  >
    {children}
  </button>
);
```

Both versions look "fine" in isolation. The OCP difference shows up only when a fifth variant is added — in the record version, one entry. In the inline version, one more `&&` clause that risks colliding with the others.

## Where OCP needs to be applied next

These are the extension points the project will have but does not have yet. Anticipating them keeps each one from being retrofitted painfully.

### Form steps (multi-step cascading form)

Each step of the salary calculator is a question + a Supabase-backed `<select>` whose options depend on previous answers. The naive shape:

```tsx
// Anti-pattern: MainForm "knows" every step in its render body
function MainForm() {
  return (
    <>
      <CountryStep onChange={...} />
      {country && <SectorStep country={country} onChange={...} />}
      {sector && <OccupationStep sector={sector} onChange={...} />}
      {/* adding a step means editing this JSX */}
    </>
  );
}
```

Every new step modifies `MainForm`. OCP-aligned: the sequence is data, not code. The form reads from a configuration:

```tsx
type StepConfig = {
  id: string;
  label: string;
  dependsOn: string | null;
  optionsQuery: (parent: string | null) => QueryDefinition;
};

const FORM_STEPS: StepConfig[] = [
  { id: 'country', label: 'Country', dependsOn: null, optionsQuery: ... },
  { id: 'sector',  label: 'Sector',  dependsOn: 'country', optionsQuery: ... },
  // adding a step = adding one entry, no MainForm edits
];
```

`MainForm` iterates over `FORM_STEPS` and renders. Adding a step does not touch `MainForm`. Reordering is a permutation of the array. This is also the shape that makes the cascading-options logic (parent selection → child query) live in one place instead of being repeated per step.

### Premium gating

The risk pattern is sprinkling `user.tier === 'premium'` checks across components. Every new tier or rule modifies every site that has a check.

OCP-aligned: each gated capability is a key on a single derived object, owned by `features/premium/hooks/useFeatureAccess.ts`:

```tsx
// features/premium/hooks/useFeatureAccess.ts
export function useFeatureAccess() {
  const { data: user } = useGetCurrentUserQuery();
  const tier = user?.app_metadata?.tier ?? 'free';

  return {
    canSaveTemplates: tier === 'premium',
    canExportPDF: tier === 'premium',
    canCompareCountries: tier === 'premium',
    // adding a third tier = changing this file only
  };
}
```

Components consume specific keys (`const { canExportPDF } = useFeatureAccess()`) — they do not inspect the tier directly. Adding a `pro` tier between `free` and `premium` is one change to one file. The `PremiumGate` component (the visual wrapper that swaps gated content for an upgrade prompt) is also a single point of change, not a pattern repeated everywhere.

### Export formats

`features/export/` will need to handle PDF first, then CSV, then possibly XLSX or share-link. The OCP shape is a registry of format handlers, each in its own file, registered into a single map:

```tsx
// features/export/exporters/index.ts
type Exporter = {
  id: 'pdf' | 'csv' | 'xlsx';
  label: string;
  run: (data: WageComparison) => Promise<Blob>;
};

export const EXPORTERS: Exporter[] = [pdfExporter, csvExporter];
// adding xlsx = one new file + one entry here, no UI changes
```

The export modal renders one button per registered exporter. Adding XLSX never touches the modal.

## A pattern to watch for: extension via prop flags instead of composition

A subtle OCP violation creeps in when a component grows a new boolean prop every time a new case appears. Each new flag is a modification to the component, plus a multiplication of internal branches:

```tsx
// Smell — every new use case adds a prop and a branch
interface ChartProps {
  showLegend?: boolean;
  showComparison?: boolean;
  showPremiumOverlay?: boolean;
  showExportButton?: boolean;
}
```

`conventions.md` §3 already names this anti-pattern ("Children and composition over prop-drilling flags"). The OCP framing is that the component is being modified for every new case, instead of being closed and the case being added as a slot/child.

OCP-aligned: the chart accepts `children` (or named slot props), and callers compose whatever overlay/legend/button they need. Adding a new overlay is a new caller, not a modified component.

## When NOT to apply OCP

OCP, like SRP, has a cost: an abstraction (record, registry, configuration array) makes the _first_ case slightly more elaborate than just writing the code inline. Indicators that an OCP abstraction is premature:

- There is exactly one case today and no concrete plan for a second. `architecture.md` §3's DRY-with-restraint applies here too: don't pre-abstract for cases that may never materialize.
- The "extension point" you'd carve out is itself complex enough that each new case is a substantial implementation anyway — the registry buys very little if every new exporter is 200 lines of bespoke code.
- The growth is enumerable and bounded. If there are only ever going to be two cases (e.g. "light theme" and "dark theme"), a boolean is fine. OCP shines when the set is genuinely open-ended.

When in doubt: write the first case inline, write the second case inline too if it appears, and refactor to a registry/configuration when the third case is on the horizon. This is the rule-of-three applied to OCP, and it matches `architecture.md` §3's preference for reversible structural choices.

## What this file does NOT do

- It does not enforce that every component must have a "variant" prop or a registry. Many components have exactly one form and that is correct.
- It does not require an inheritance hierarchy — OCP in React is achieved via composition, configuration, and slots, never via class extension.
- It does not introduce abstractions before they are needed (rule of three applies).
- It does not contradict the variant system in `Button.tsx` or `Badge.tsx` — those are already OCP-aligned.

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
