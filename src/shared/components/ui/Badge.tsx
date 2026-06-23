import { cn } from '@/shared/lib/cn';

import type { ReactNode } from 'react';

/** Semantic intents — map 1:1 to the invariant tokens in DESIGN.md §1. */
type BadgeVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Each intent uses its semantic token at low opacity for the fill plus the
 * solid token for text/border, so the badge reads on both light and dark
 * surfaces (the semantic tokens are invariant across modes by design).
 */
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  info: 'bg-info/15 text-info border border-info/30',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  error: 'bg-error/15 text-error border border-error/30',
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = 'info', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
