import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The three variants defined in DESIGN.md §7, plus `destructive-outline` —
 * same outline shape (border + transparent bg) but on the `error` token
 * instead of `primary`, for irreversible actions styled as secondary/outline
 * (e.g. "Cancel Subscription"). Not in §7 by name, but needed because
 * `cn()` has no Tailwind merge (documented in `shared/lib/cn.ts`): a caller
 * can't override `outline`'s border-primary/text-primary via className on
 * the same utility axis, so this is a variant, not a class override.
 */
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive-outline';

/**
 * Per-variant color/border classes. `Disabled` from §7 is a visual STATE, not
 * a separate variant: the native `disabled` attribute (or `isLoading`) swaps
 * any variant into the disabled look via `DISABLED_CLASSES`, so callers don't
 * pick "disabled" explicitly — they pass `disabled` like a normal button.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  outline: 'border border-primary text-primary hover:bg-primary-muted',
  ghost: 'text-muted hover:bg-surface-hover',
  'destructive-outline': 'border border-error text-error hover:bg-error/10',
};

/**
 * Disabled look from §7: `gray` background, `muted` text — using the existing
 * --gray / --muted tokens, no new color introduced. Overrides the variant
 * classes when active.
 */
const DISABLED_CLASSES = 'bg-gray text-muted border-transparent cursor-not-allowed';

const BASE_CLASSES = cn(
  'inline-flex items-center justify-center gap-2',
  'px-6 py-3 rounded-full font-semibold',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Shows a spinner and blocks interaction while an action is in flight. */
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        BASE_CLASSES,
        isDisabled ? DISABLED_CLASSES : VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {isLoading && <Icon icon={Loader2} size={20} className="animate-spin" />}
      {children}
    </button>
  );
}
