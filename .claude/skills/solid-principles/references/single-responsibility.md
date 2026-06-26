# Single Responsibility Principle in wage-comparator

> One module, one reason to change. The unit can be a component, a hook, an RTK slice, or an endpoint — but the principle is the same: if you can name two unrelated reasons why this file would need to be edited, it has too many responsibilities.

This file explains how SRP is applied in this project specifically. It does **not** restate the principle in the abstract, and it does **not** repeat hard rules — those live in `docs/conventions.md`. The job of this file is to develop the thinking discipline.

## What counts as a "reason to change" in this codebase

A reason to change is a real-world axis of variation. In a salary comparison app, the axes of variation that matter are:

- **Visual design** — colors, spacing, typography (changes in `DESIGN.md`).
- **Data shape** — what Supabase returns, what RTK Query exposes.
- **Computation** — how a derived statistic (mean, Q1, Q3) is calculated from raw records.
- **Form orchestration** — which step comes next, what unlocks what, how cascading selects react.
- **Routing / navigation** — what URL maps to what page, what guards apply.
- **Access tier** — what a free user can do vs. a premium user.

Two of these on the same axis (e.g. "the form has a new visual style and adopts a new color token") are not two reasons — they are one reason ("the design system evolved"). Two on different axes (e.g. "the form has a new step *and* the chart now reads from a new Supabase column") are two reasons. SRP-sensitive code separates the second case; the first case does not need separating.

## Why this matters more than line counts

Generic SOLID advice tends to enforce SRP via line limits ("split at 90 lines"). This project rejects that approach — `architecture.md` §3 explicitly prefers reversible structural choices over forced fragmentation.

A 200-line component that changes for exactly one reason (e.g. an isolated, complex visual layout) is not violating SRP. A 40-line component that fetches data, computes a statistic, formats it, and renders a chart is violating SRP four times over despite being short. Length is a smell, not a verdict — and the question is always "how many axes of change does this file sit on", not "how many lines does it have".

## Where the cuts naturally fall in this stack

The feature-based layout in `architecture.md` §2 already pre-cuts most SRP boundaries for you. When a piece of work spans multiple boundaries, the layout tells you where the seams go:

- `api/` files (RTK Query endpoints) own one responsibility: turning a Supabase query into a typed cached resource. They do not format, derive, or transform — that is downstream.
- `hooks/` files own derivations and orchestration. A hook like `useWageStats` takes the cached resource and computes mean/Q1/Q3. It does not fetch (the endpoint does) and does not render (the component does).
- `components/` files own JSX, accessibility, and event wiring. They consume the hook's output, pass it to Recharts or to FieldShell, and dispatch user actions. They do not compute statistics inline, do not call Supabase, do not own form schema validation.

When you find a component doing two of these jobs, the cut is obvious: extract the non-rendering job into a hook (or an endpoint, if it's data access).

## Worked example: a page-level split that respects SRP

Generic SOLID examples shine on small components and become useless on real pages. The harder — and more relevant — version of SRP in this codebase is at the page/feature level, where many responsibilities pile up naturally if you let them.

Take a hypothetical `UserDashboardLayout` page (the `/dashboard` route from the page tree, which acts as a layout container for `/dashboard/settings`, `/dashboard/templates`, `/dashboard/comparisons` via React Router's `<Outlet />`). The naive way to write this page collapses several responsibilities into one component:

```tsx
// Anti-pattern: one component owning four axes of change
export function UserDashboardLayout() {
  // 1. Data fetch — calls Supabase directly via raw client
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // 2. Derivation — computes "is premium" from the user object inline
  const isPremium = user?.app_metadata?.tier === 'premium';

  // 3. Navigation — knows the dashboard tab structure
  const tabs = [
    { to: '/dashboard/settings', label: 'Settings' },
    { to: '/dashboard/templates', label: 'Templates', requiresPremium: true },
    { to: '/dashboard/comparisons', label: 'Comparisons' },
  ];

  // 4. Rendering — JSX, ARIA, layout, conditional tab gating
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <nav aria-label="Dashboard sections">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) => isActive ? 'active' : ''}
            aria-disabled={t.requiresPremium && !isPremium}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <main><Outlet /></main>
    </div>
  );
}
```

Four reasons to change in one file:

- The auth API moves from raw Supabase client to RTK Query — this file changes.
- The premium tier logic gains a second tier ("pro") — this file changes.
- A new dashboard tab is added — this file changes.
- The dashboard sidebar gets a new visual treatment — this file changes.

Each of those is a separate axis. The SRP-aligned split, using the seams that `architecture.md` §2 already provides:

- **RTK Query endpoint** in `features/auth/api/` exposes `useGetCurrentUserQuery()` — one responsibility: typed cached resource for the current user. (`useEffect` for data fetching is forbidden by `architecture.md` §5; RTK Query handles it.)
- **Premium-tier hook** in `features/premium/hooks/useFeatureAccess.ts` consumes that endpoint and returns `{ isPremium, canAccessTemplates, canExport }` — one responsibility: deriving access from the user record. When a new tier appears, only this file changes.
- **Tab configuration** lives next to the layout (or in its own module if it grows), as a plain `const` array — one responsibility: declaring what tabs exist. Adding a tab changes only this constant.
- **`UserDashboardLayout` itself** consumes the hook, reads the configuration, and renders. Its responsibility is now exactly one thing: laying out the dashboard chrome (sidebar + outlet) and wiring premium-gated tabs visually. It owns no data access, no derivation, no source of truth.

The component is no shorter than the anti-pattern version — probably slightly longer in total lines across files. That is fine. SRP is not about reducing the total line count; it is about ensuring that each future change lands in exactly one file, not three.

### What about the file the user actually clicks?

There is a related but separate question: `/dashboard/settings` is described as a page that contains "Change User Data" and "Billing" as inline cards, plus a link to `/dashboard/settings/manage-plan` as a separate route. The SRP question for that page is the same: each card is its own concern (each one has its own reason to change — billing API, profile schema, plan management), so each card is its own component file in `features/auth/components/` or `features/premium/components/`, and the page just composes them. The page itself owns one thing: the composition.

## A pattern to watch for: hidden second responsibility in props

A subtle SRP violation that creeps in via props is when a component accepts a boolean that branches its behavior in two unrelated ways. `conventions.md` §3 already warns about this ("Children and composition over prop-drilling flags") — the SRP framing is that the second boolean is forcing the component to know about two different responsibilities at once.

Example shape to watch for, when planning a component:

```tsx
// Smell: the component now owns "header rendering" AND "footer rendering"
// AND the decision of when to show each, controlled externally by flags.
interface FormPanelProps {
  showHeader?: boolean;
  showFooter?: boolean;
  isCompact?: boolean;
  children: ReactNode;
}
```

The SRP fix is to give the caller compositional control (slot props or `children`) instead of having the component own the toggle logic. The component then has one responsibility: laying out whatever it is given.

## When NOT to split

SRP is a discipline, not a target. Splitting prematurely creates indirection that hurts more than it helps. Indicators that a split is premature:

- The "responsibility" you'd extract is used exactly once and nowhere else is on the horizon. `conventions.md` §3 explicitly says hooks are not extracted on first repetition.
- The split would require passing more props to the new piece than the original had inputs. The interface cost exceeds the cohesion benefit.
- The two responsibilities you see are really one responsibility expressed at two layers (e.g. "rendering" and "applying ARIA attributes for that rendering" — those are the same responsibility, not two).

When in doubt, `architecture.md` §3's rule applies: prefer the smaller, more reversible choice. Leaving code inline and revisiting after a second use case appears is cheap; over-fragmenting and reconsolidating later is expensive.

## What this file does NOT do

- It does not define line limits (none exist in this project).
- It does not require JSDoc on extracted units (see `conventions.md` §6).
- It does not enforce specific folder names beyond what `architecture.md` §2 already documents.
- It does not contradict barrel exports — feature `index.ts` barrels are mandatory here (`conventions.md` §4, §5).

If those rules ever appear in this file in a future edit, that edit is wrong and should be reverted.
