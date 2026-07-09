# Liskov Substitution Principle in wage-comparator

> If two units share a contract, they must be interchangeable for any caller of that contract. A subtype, variant, or wrapper that silently changes behavior, swallows props, or imposes new preconditions breaks the substitution guarantee — even if the type signature still compiles.

This file explains how LSP applies in a React + TypeScript codebase that uses no class inheritance. "Liskov" here is almost entirely about behavioral compatibility behind shared interfaces.

## Why LSP needs care in a no-inheritance codebase

LSP is the SOLID principle most often dismissed in React advice as "not applicable, we don't use classes." That dismissal is wrong. The principle applies any time two pieces of code share a contract — explicit (a TypeScript interface, a hook return shape, an RTK Query endpoint signature) or implicit (the conventions a wrapping component is assumed to honor). What changes in React/TS is the _vocabulary_: instead of "subclass must honor base class contract", read "wrapping component must honor wrapped component contract", or "variant must honor variant family contract", or "alternate implementation must honor endpoint contract".

The reason LSP earns its place in this project is that almost every shared primitive will eventually be wrapped, specialized, or replaced. A LSP-broken wrapper is silently lethal: it compiles, it looks fine in isolation, and it breaks callers in ways that only surface when a caller actually tries to substitute it.

## Where LSP applies in this codebase

### Field controls wrapped in `FieldShell`

`Input`, `Textarea`, and `Select` all share `FieldShell` as their visual envelope. The contract they collectively expose is: _render a labeled form control with optional helper text, error message, and disabled state, where the label, helper, and error are visually positioned the same way and connected to the control via `aria-describedby`/`aria-invalid`_.

LSP holds when a caller can swap one for another within the limits of "this field accepts a single string" vs. "this field accepts multi-line text" vs. "this field accepts a closed list of options" without:

- discovering that one of them silently ignores `error` while the others render it,
- finding that one omits the ARIA attributes the others set,
- realizing one positions its helper text above the control while the others put it below,
- being surprised by one of them not supporting `disabled` for purely cosmetic reasons.

The structural reason this works in practice is that the three controls delegate the shell-level concerns to `FieldShell.tsx` itself, not to their own bodies. If a future contributor builds a fourth field control and reimplements the label/error rendering inline "to customize it a little," LSP breaks immediately — that fourth control no longer obeys the same visual or accessibility contract as the others, so callers cannot substitute it freely.

### Premium-gated features

`useFeatureAccess` returns a flat object of capabilities (`canSaveTemplates`, `canExportPDF`, etc., from the OCP file). The hook itself does not have a Liskov problem — it has one implementation. The LSP-relevant pattern is what happens when premium-gated components (e.g. `SaveTemplateButton`, `ExportPDFButton`) all share a contract: "_render disabled-with-upgrade-prompt when access is denied, render functional when access is granted_."

A premium-gated component that, when denied, silently renders `null` instead of an upgrade prompt breaks LSP relative to its peers. Callers that compose multiple gated components into a row expect consistent visual treatment when access is denied — one of them disappearing entirely is a substitution violation even though no error is thrown.

### Exporters

When `features/export/` grows (see OCP file), each `Exporter` registered into the `EXPORTERS` array shares the contract `(data: WageComparison) => Promise<Blob>`. LSP requires that:

- A new exporter does not impose stronger preconditions than its peers (e.g. throwing if `data` lacks an optional field that the others handle gracefully).
- A new exporter does not weaken postconditions (e.g. returning a Blob that omits the chart image when the PDF exporter includes it — if the contract is "complete export," every implementation must deliver it).
- A new exporter does not throw exception classes its peers do not throw, or, if it must, the registry/UI layer is updated to handle that family of exceptions uniformly.

This is where LSP and OCP overlap productively: OCP says "add a new exporter without modifying the existing ones." LSP says "and make sure the new one really does behave the same way from the caller's perspective." Both are needed.

## A pattern to watch for: a "variant" that secretly changes the rendered element

A subtle LSP violation creeps in when an enum-like variant prop actually swaps the underlying DOM element or the event contract:

```tsx
// Smell — `link` is not a variant of Button; it's a different component
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'link';

export function Button({ variant, onClick, href, ...props }: ButtonProps) {
  if (variant === 'link') {
    // ↑ now this "Button" sometimes is an <a>
    return (
      <a href={href} {...props}>
        {props.children}
      </a>
    );
  }
  return (
    <button onClick={onClick} {...props}>
      {props.children}
    </button>
  );
}
```

The type union claims `link` is a fourth variant of Button. In reality, the `link` case:

- expects a different prop (`href`, not `onClick`),
- emits different events (no `MouseEvent<HTMLButtonElement>`, no `disabled` semantics),
- has different accessibility implications (a link is not a button to assistive tech).

A caller that wrote `<Button variant={isExternal ? 'link' : 'primary'}>` thinking they were substituting one variant for another has a LSP violation waiting — the link-variant doesn't honor the button contract. The right shape is a separate component (`LinkAsButton`, or simply use `<a className="...">`), not a variant.

`Button.tsx` in this project deliberately does _not_ fall into this trap: the three real variants (`primary`, `outline`, `ghost`) are all `<button>` elements with identical DOM semantics, differing only in CSS classes. They are genuinely substitutable.

## A pattern to watch for: feature-side wrappers that strip props

Another LSP risk is a feature wrapping a shared component to "specialize" it, and in the process narrowing the contract:

```tsx
// features/salary-calculator/components/SalaryStepSelect.tsx
// Smell — the wrapper accepts only a subset of Select's contract
interface SalaryStepSelectProps {
  options: WageOption[];
  value: string;
  onChange: (next: string) => void;
}

export function SalaryStepSelect({ options, value, onChange }: SalaryStepSelectProps) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
```

This is _fine_ if `SalaryStepSelect` is a deliberate feature-side component with its own identity — its name signals it is not a `Select`, it is a salary-step-specific composition. LSP is not violated because no one is substituting it for a generic `Select`.

LSP breaks when the wrapper _pretends_ to be the same as the original — e.g. `SalaryStepSelect` is exposed from `shared/` as if it were interchangeable with the generic `Select`, or it is named `Select` in the feature folder so callers cannot tell which one they imported. The principle is honesty about whether two components are the same contract or different contracts.

## When LSP is genuinely not a concern

Not every pair of components needs to be substitutable. Two components that happen to share two prop names (e.g. both accept `className`) are not in a shared contract — they have a shared _attribute_. LSP only applies when callers genuinely depend on interchangeability, which happens in three places in this project:

- Behind the `FieldShell` interface (the three form controls).
- Behind the `Exporter` interface (the registered export formats).
- Behind variant systems where the variant is purely cosmetic and the underlying element/contract is identical.

Outside of those, "this looks similar to that" does not mean LSP applies. Most components in the codebase have their own contract for their own job, and that is correct.

## What this file does NOT do

- It does not require classes, inheritance, or `extends` for anything. React composition is the substrate; LSP applies through interface contracts and behavioral compatibility, not type hierarchies.
- It does not require an explicit TypeScript interface for every group of "similar" components. Many components are similar without being substitutable, and that is fine.
- It does not contradict OCP's registry/configuration patterns — those patterns require LSP-compliant entries, which is why both files are needed.
- It does not enforce that wrappers must expose the entire wrapped contract. A wrapper with a deliberately narrower contract is fine; what is forbidden is a wrapper that pretends to be the same contract while behaving differently.

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
