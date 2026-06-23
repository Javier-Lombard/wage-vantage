import type { ElementType, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * Closed set of text styles mapping to the type scale in DESIGN.md §2.
 * Headings, body sizes, and the smaller label/caption roles.
 */
type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'label'
  | 'caption';

/**
 * Each variant resolves to Tailwind utilities built from the §2 scale
 * (size → weight). Line-heights come from Tailwind's text-* defaults, which
 * match the scale in §2 (e.g. text-4xl → 40px line-height).
 */
const VARIANT_CLASSES: Record<TextVariant, string> = {
  h1: 'text-4xl font-bold', // Hero heading — 4xl / 700
  h2: 'text-3xl font-bold', // Page heading — 3xl / 700
  h3: 'text-2xl font-semibold', // Section heading — 2xl / 600
  h4: 'text-xl font-semibold', // Card title — xl / 600
  h5: 'text-lg font-semibold', // Emphasis — lg / 600
  h6: 'text-base font-semibold', // Smallest heading — base / 600
  'body-lg': 'text-lg font-normal', // Lead paragraph — lg / 400
  body: 'text-base font-normal', // Body text — base / 400
  'body-sm': 'text-sm font-normal', // Helper/secondary body — sm / 400
  label: 'text-sm font-semibold', // Form labels — sm / 600
  caption: 'text-xs font-light text-muted-foreground', // Fine print — xs / 300
};

/** Default semantic element per variant; override with the `as` prop. */
const VARIANT_ELEMENT: Record<TextVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'span',
};

interface TextProps {
  variant?: TextVariant;
  /** Override the rendered element without changing the visual style. */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Text({ variant = 'body', as, className, children }: TextProps) {
  const Component = as ?? VARIANT_ELEMENT[variant];
  return <Component className={cn(VARIANT_CLASSES[variant], className)}>{children}</Component>;
}
