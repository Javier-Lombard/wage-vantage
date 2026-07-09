import { cn } from './cn';

/**
 * Clases para un botón "outline" plano legible en ambos modos. El variant
 * `outline` de Button usa `border/text-primary` (#dfff88), que no contrasta
 * sobre fondos claros; como cn() no hace tailwind-merge, no se puede recolorar
 * ese variant por className.
 *
 * El color se resuelve por los tokens mode-aware `outline-*` (definidos en
 * index.css: neutros en :root, primary en .dark) — el patrón del proyecto para
 * valores dependientes del modo (DESIGN.md §8), no el prefijo `dark:` (que aquí
 * respondería al prefers-color-scheme del SO, no al toggle de la app).
 *
 * No es un variant de Button porque los tres consumidores son botones planos
 * con contenido/estado distintos (toggle de theme, trigger de comparación,
 * botones OAuth); comparten solo la forma pill y el esquema de color.
 */
const BASE = cn(
  'inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors',
  'focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
);

const ENABLED = cn(
  'cursor-pointer',
  'border-outline-border text-outline-fg hover:bg-outline-hover',
);

const DISABLED = 'border-transparent bg-gray text-muted cursor-not-allowed';

export function outlineButtonClasses(isDisabled = false): string {
  return cn(BASE, isDisabled ? DISABLED : ENABLED);
}
