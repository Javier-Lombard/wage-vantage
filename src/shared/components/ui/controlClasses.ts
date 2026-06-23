/**
 * Shared styling for the form controls (Input, Textarea, Select) from
 * DESIGN.md §7 "Inputs / Selects". Lives in its own module rather than inside
 * Input.tsx so the control components stay component-only files (the
 * `react-refresh/only-export-components` rule, see docs/conventions.md §3).
 */

/** Surface, border, radius, padding, text + focus/disabled base. */
export const CONTROL_BASE =
  'w-full bg-surface border rounded-sm px-4 py-3 text-base text-foreground placeholder:text-muted transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray disabled:text-muted';

/** Border + focus-ring color depending on the error state. */
export function controlStateClasses(hasError: boolean): string {
  return hasError ? 'border-error focus:ring-error' : 'border-border focus:ring-primary';
}
