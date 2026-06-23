/**
 * Joins class names, dropping falsy values so conditional classes can be
 * written inline (`cond && 'class'`) without leaving stray `false`/`undefined`
 * in the output. No conflict-resolution (tailwind-merge) on purpose: variant
 * maps in the UI primitives never overlap on the same utility axis, so a plain
 * filter-and-join is enough.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
