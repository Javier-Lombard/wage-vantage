# Design System — Wage Comparator

Reference: TRADE.ly fintech UI. Data-oriented, clean and modern. Dark mode is the primary reference (extracted directly from source material); light mode is a derived, coherent counterpart — both fully specified in §1.

---

## 1. Color Tokens

This design system is **dual-mode**: dark mode is the primary reference (derived directly from the TRADE.ly source), light mode is a derived, coherent inversion that preserves the same contrast proportions. Both modes share the same token _names_ — only the resolved value changes. This is what makes the Tailwind `@theme` + CSS variable setup in §8 work with a single `.dark` class toggle.

### Core Palette — Dark Mode (primary reference)

| Token              | Hex         | Role                                          |
| ------------------ | ----------- | --------------------------------------------- |
| `primary`          | `#DFFF88`   | Brand accent, CTAs, active states, highlights |
| `primary-hover`    | `#C8E67A`   | Primary on hover/pressed                      |
| `primary-muted`    | `#DFFF8833` | Primary at 20% opacity — subtle backgrounds   |
| `background`       | `#13161C`   | Main page background                          |
| `surface`          | `#1A1F27`   | Cards, panels, elevated containers            |
| `surface-hover`    | `#222833`   | Surface on hover                              |
| `foreground`       | `#FFFFFF`   | Primary text                                  |
| `muted`            | `#8A95A3`   | Secondary text, labels, placeholders          |
| `muted-foreground` | `#A8AEAE`   | Tertiary text, captions, metadata             |
| `border`           | `#2A3040`   | Default border color, dividers                |
| `border-subtle`    | `#1F2530`   | Subtle separators, card edges                 |
| `gray`             | `#4D4D4D`   | Disabled elements, inactive states            |

### Core Palette — Light Mode (derived inversion)

Approved palette. Not a brutalist invert (white↔black) — preserves the same "cool" temperature and the same contrast ratios the dark mode establishes between background/surface/text.

| Token              | Hex         | Role                                          | Relationship to dark value                                                                         |
| ------------------ | ----------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `primary`          | `#DFFF88`   | Brand accent, CTAs, active states, highlights | Unchanged — sufficiently saturated to work on light backgrounds                                    |
| `primary-hover`    | `#C8E67A`   | Primary on hover/pressed                      | Unchanged                                                                                          |
| `primary-muted`    | `#DFFF8833` | Primary at 20% opacity — subtle backgrounds   | Unchanged                                                                                          |
| `background`       | `#F5F6F8`   | Main page background                          | Cool light gray, not pure white — keeps the same blue-tinted neutrality as `#13161C`               |
| `surface`          | `#FFFFFF`   | Cards, panels, elevated containers            | Pure white — differentiates from `background` the same way `#1A1F27` differentiates from `#13161C` |
| `surface-hover`    | `#EDF0F4`   | Surface on hover                              | Mirrors `surface-hover` step from dark                                                             |
| `foreground`       | `#13161C`   | Primary text                                  | Mirror swap of dark's `background`                                                                 |
| `muted`            | `#5A6475`   | Secondary text, labels, placeholders          | Darkened mirror of dark's `#8A95A3` — needed for AA contrast on light bg                           |
| `muted-foreground` | `#71798A`   | Tertiary text, captions, metadata             | Darkened mirror of dark's `#A8AEAE`                                                                |
| `border`           | `#D1D8E4`   | Default border color, dividers                | Light mirror of dark's `#2A3040`                                                                   |
| `border-subtle`    | `#E4E8EE`   | Subtle separators, card edges                 | Light mirror of dark's `#1F2530`                                                                   |
| `gray`             | `#B8BCC2`   | Disabled elements, inactive states            | Light mirror of dark's `#4D4D4D`                                                                   |

### Semantic Colors (invariant — same in both modes)

These already have valid contrast against both light and dark surfaces, so they don't change between modes.

| Token     | Hex       | Usage                        |
| --------- | --------- | ---------------------------- |
| `success` | `#4ADE80` | Positive change, valid state |
| `warning` | `#FBBF24` | Alerts, attention needed     |
| `error`   | `#F87171` | Errors, destructive actions  |
| `info`    | `#60A5FA` | Informational, links         |

### On-Primary (text/icons placed on top of `primary` backgrounds — invariant)

| Token        | Hex       | Role                                                                                                                                           |
| ------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `on-primary` | `#13161C` | Text/icons on primary-colored surfaces. Same in both modes — `primary` itself doesn't change, so the text on top of it doesn't need to either. |

### Chart Palette (for Recharts — multi-country comparison, invariant)

Designed to be distinguishable on both `#13161C` (dark bg) and `#F5F6F8` (light bg), and accessible in combination. Kept identical across modes so a chart screenshotted in either theme reads consistently.

| Token     | Hex       | Usage                   |
| --------- | --------- | ----------------------- |
| `chart-1` | `#DFFF88` | Primary data (accent)   |
| `chart-2` | `#60A5FA` | Second series (blue)    |
| `chart-3` | `#F472B6` | Third series (pink)     |
| `chart-4` | `#34D399` | Fourth series (emerald) |
| `chart-5` | `#FB923C` | Fifth series (orange)   |
| `chart-6` | `#A78BFA` | Sixth series (violet)   |

---

## 2. Typography

### Font Family

**Poppins** (Google Fonts) — geometric sans-serif.

Weights loaded: 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold).

Fallback stack: `'Poppins', system-ui, -apple-system, sans-serif`

### Type Scale

| Token  | Size            | Line Height    | Weight    | Usage                       |
| ------ | --------------- | -------------- | --------- | --------------------------- |
| `xs`   | 0.75rem (12px)  | 1rem (16px)    | 400       | Captions, fine print        |
| `sm`   | 0.875rem (14px) | 1.25rem (20px) | 400       | Labels, helper text         |
| `base` | 1rem (16px)     | 1.5rem (24px)  | 400       | Body text, paragraphs       |
| `lg`   | 1.125rem (18px) | 1.75rem (28px) | 400 / 600 | Lead paragraphs, emphasis   |
| `xl`   | 1.25rem (20px)  | 1.75rem (28px) | 600       | Card titles, section intros |
| `2xl`  | 1.5rem (24px)   | 2rem (32px)    | 600       | Section headings (H3)       |
| `3xl`  | 1.875rem (30px) | 2.25rem (36px) | 700       | Page headings (H2)          |
| `4xl`  | 2.25rem (36px)  | 2.5rem (40px)  | 700       | Hero headings (H1)          |
| `5xl`  | 3rem (48px)     | 1              | 700       | Display / stat numbers      |

### Weight Tokens

| Token      | Value | Usage                          |
| ---------- | ----- | ------------------------------ |
| `light`    | 300   | Captions, decorative text      |
| `regular`  | 400   | Body, labels, descriptions     |
| `semibold` | 600   | Buttons, subheadings, emphasis |
| `bold`     | 700   | Headings, stat numbers         |

---

## 3. Spacing

Base unit: 4px (0.25rem). Follows Tailwind default scale, no overrides needed.

Key application guidelines:

| Context                 | Spacing                                | Tailwind class          |
| ----------------------- | -------------------------------------- | ----------------------- |
| Card inner padding      | 24px (1.5rem)                          | `p-6`                   |
| Section vertical gap    | 64px (4rem)                            | `py-16`                 |
| Between form fields     | 16px (1rem)                            | `space-y-4`             |
| Between form steps      | 24px (1.5rem)                          | `gap-6`                 |
| Button inner padding    | 12px v / 24px h                        | `px-6 py-3`             |
| Nav item spacing        | 32px (2rem)                            | `gap-8`                 |
| Page horizontal padding | 16px mobile, 32px tablet, 64px desktop | `px-4 md:px-8 lg:px-16` |
| Max content width       | 1280px                                 | `max-w-7xl`             |

---

## 4. Border Radius

| Token  | Value          | Usage                         |
| ------ | -------------- | ----------------------------- |
| `sm`   | 0.375rem (6px) | Inputs, small badges          |
| `md`   | 0.5rem (8px)   | Default controls, tags        |
| `lg`   | 0.75rem (12px) | Cards, modals, dropdowns      |
| `xl`   | 1rem (16px)    | Large cards, hero sections    |
| `2xl`  | 1.5rem (24px)  | Feature cards, CTA blocks     |
| `full` | 9999px         | Buttons (pill shape), avatars |

Primary CTA buttons use `rounded-full` (pill shape). Cards use `rounded-xl` or `rounded-2xl`.

---

## 5. Shadows

Minimal shadow usage in both modes — surface color differentiation (`surface` vs `background`) does most of the elevation work; shadows are a light reinforcement, not the primary depth cue. Black-tinted shadows at low opacity work acceptably in both light and dark mode (see §8 for the optional `--shadow-color` variable if you want to fine-tune per mode later).

| Token  | Value                                | Usage               |
| ------ | ------------------------------------ | ------------------- |
| `sm`   | `0 1px 2px rgba(0, 0, 0, 0.3)`       | Subtle elevation    |
| `md`   | `0 4px 12px rgba(0, 0, 0, 0.4)`      | Cards, dropdowns    |
| `lg`   | `0 8px 24px rgba(0, 0, 0, 0.5)`      | Modals, popovers    |
| `glow` | `0 0 20px rgba(223, 255, 136, 0.15)` | Primary accent glow |

---

## 6. Component Patterns

### Buttons

| Variant  | Background  | Text         | Border    | Radius        |
| -------- | ----------- | ------------ | --------- | ------------- |
| Primary  | `primary`   | `on-primary` | none      | `full` (pill) |
| Outline  | transparent | `primary`    | `primary` | `full` (pill) |
| Ghost    | transparent | `muted`      | none      | `full`        |
| Disabled | `gray`      | `muted`      | none      | `full`        |

Font weight: SemiBold (600). Padding: `px-6 py-3`. Transition on hover for background/border color.

### Cards

Background: `surface`. Border: 1px `border-subtle` or none (rely on bg contrast). Radius: `rounded-xl` or `rounded-2xl`. Padding: `p-6`.

### Inputs / Selects

Background: `surface` or `background`. Border: 1px `border`. Radius: `rounded-sm` (6px). Padding: `px-4 py-3`. Text: `foreground`. Placeholder: `muted`. Focus ring: 2px `primary`.

### Navigation

Background: `background` with slight opacity or solid. Text: `muted` default, `foreground` on hover, `primary` for active. CTA button in nav: Outline variant.

### Charts (Recharts)

Background: transparent (inherits page `background`). Grid lines: `border` color at low opacity. Axis labels: `muted` color, `xs` size. Tooltip background: `surface`. Tooltip border: `border`. Use `chart-1` through `chart-6` for series colors.

---

## 7. Dark / Light Mode Strategy

Both modes are now fully specified (§1). The implementation pattern matters because Tailwind v4's `@theme` block defines **static** values — it cannot hold two resolutions for the same token. The correct pattern is:

1. Define each token as a plain CSS variable in `:root` (light values — the default) and re-defined inside `.dark` (dark values).
2. Inside `@theme`, point each `--color-*` token at the corresponding plain variable (e.g. `--color-background: var(--background)`), not at a literal hex.
3. Toggle dark mode by adding/removing the `.dark` class on `<html>` (this is what `ThemeProvider` should do — see `docs/conventions.md` once written).

This way, `bg-background` always resolves correctly regardless of which mode is active, because the underlying plain variable changes — not the Tailwind utility.

**Default mode**: light is the CSS default (`:root`), since that's the conventional baseline, but the _product_ default behavior (which mode loads on first visit) is an app-level decision for `ThemeProvider`/`localStorage`, not a CSS one — don't conflate the two.

Tailwind v4's `@variant dark` (powered by the `.dark` selector) is what makes `dark:` prefixed utilities work for one-off overrides, but for token-driven values like `bg-background` or `text-muted`, you don't need `dark:` prefixes at all — the variable swap handles it automatically.

---

## 8. Tailwind v4 Configuration

Paste this into `src/index.css` to register all design tokens as Tailwind utilities, with full dark/light support via the `.dark` class.

```css
@import 'tailwindcss';

/* ── Google Font ── */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

/* ── Light mode (default) — plain CSS variables ── */
:root {
  --primary: #dfff88;
  --primary-hover: #c8e67a;
  --primary-muted: #dfff8833;
  --on-primary: #13161c;

  --background: #f5f6f8;
  --surface: #ffffff;
  --surface-hover: #edf0f4;

  --foreground: #13161c;
  --muted: #5a6475;
  --muted-foreground: #71798a;

  --border: #d1d8e4;
  --border-subtle: #e4e8ee;
  --gray: #b8bcc2;
}

/* ── Dark mode — same variable names, dark values ── */
.dark {
  --primary: #dfff88;
  --primary-hover: #c8e67a;
  --primary-muted: #dfff8833;
  --on-primary: #13161c;

  --background: #13161c;
  --surface: #1a1f27;
  --surface-hover: #222833;

  --foreground: #ffffff;
  --muted: #8a95a3;
  --muted-foreground: #a8aeae;

  --border: #2a3040;
  --border-subtle: #1f2530;
  --gray: #4d4d4d;
}

/* ── Design Tokens — @theme maps to the plain variables above ── */
@theme {
  /* Colors — Core (mode-aware, resolved via :root / .dark above) */
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-muted: var(--primary-muted);
  --color-on-primary: var(--on-primary);

  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);

  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
  --color-gray: var(--gray);

  /* Colors — Semantic (invariant across modes, literal values) */
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;

  /* Colors — Charts (invariant across modes, literal values) */
  --color-chart-1: #dfff88;
  --color-chart-2: #60a5fa;
  --color-chart-3: #f472b6;
  --color-chart-4: #34d399;
  --color-chart-5: #fb923c;
  --color-chart-6: #a78bfa;

  /* Typography */
  --font-sans: 'Poppins', system-ui, -apple-system, sans-serif;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(223, 255, 136, 0.15);
}

/* ── Base Styles ── */
@layer base {
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

### Resulting Utility Classes

After the `@theme` block above, these utilities become available — and they automatically resolve to the correct mode based on whether `.dark` is present on `<html>`:

**Colors:** `bg-primary`, `text-primary`, `border-primary`, `bg-surface`, `text-muted`, `border-border`, `text-chart-1`, etc.

**Typography:** `font-sans` applies Poppins.

**Radius:** `rounded-sm` through `rounded-full`.

**Shadows:** `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-glow`.

### Usage Examples

These examples work unchanged in both light and dark mode — no `dark:` prefixes needed, because the underlying variables already swap.

```html
<!-- Primary pill button -->
<button
  class="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full
               hover:bg-primary-hover transition-colors"
>
  Get Started
</button>

<!-- Outline button -->
<button
  class="border border-primary text-primary font-semibold px-6 py-3
               rounded-full hover:bg-primary-muted transition-colors"
>
  Learn More
</button>

<!-- Card -->
<div class="bg-surface border border-border-subtle rounded-xl p-6">
  <h3 class="text-xl font-semibold text-foreground">Card Title</h3>
  <p class="text-sm text-muted mt-2">Description text here.</p>
</div>

<!-- Form select -->
<select
  class="w-full bg-surface border border-border rounded-sm px-4 py-3
               text-foreground placeholder:text-muted
               focus:outline-none focus:ring-2 focus:ring-primary"
>
  <option>Select country...</option>
</select>

<!-- Stat display -->
<span class="text-5xl font-bold text-primary">$45,200</span>
```

---

## 9. Poppins Font Loading

Load via Google Fonts CSS import (already included in the `@theme` block above). Only the four weights actually used:

- `300` — Light (captions)
- `400` — Regular (body)
- `600` — SemiBold (buttons, subheadings)
- `700` — Bold (headings, stats)

For performance, use `display=swap` (included in the import URL) to avoid FOIT.
