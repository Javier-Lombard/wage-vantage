import type { LucideIcon } from 'lucide-react';

/**
 * Single wrapper over lucide-react icons (DESIGN.md §6) so the reference
 * stroke weight and sizing defaults stay centralized instead of being repeated
 * at every call site. Color is intentionally NOT a prop: icons inherit
 * `currentColor`, so callers set color through a `text-*` token on a parent (or
 * via `className` here), which keeps them mode-aware automatically.
 */
interface IconProps {
  /** The lucide-react icon to render, e.g. `Bell`. */
  icon: LucideIcon;
  /** 20 for inline/nav contexts, 24 for standalone feature icons. */
  size?: number;
  /** Uniform 2px stroke matches the reference; avoid 1.5/1.25 variants. */
  strokeWidth?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  'aria-label'?: string;
}

export function Icon({
  icon: LucideGlyph,
  size = 20,
  strokeWidth = 2,
  className,
  'aria-label': ariaLabel,
}: IconProps) {
  return (
    <LucideGlyph
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
