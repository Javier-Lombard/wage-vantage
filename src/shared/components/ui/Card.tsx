import { cn } from '@/shared/lib/cn';

import type { ElementType, ReactNode } from 'react';

/**
 * Superficie elevada genérica (DESIGN.md §7: bg-surface, border-subtle,
 * rounded-xl/2xl, p-6) — reemplaza el div inline repetido en cards, paneles
 * y secciones de todo el mock. `interactive` añade el hover/focus propio de
 * una card clicable (dashboard, plan cards) sin forzar un <button>/<a>: el
 * elemento real lo decide el caller vía `as`.
 */
interface CardProps {
  as?: ElementType;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({
  as: Component = 'div',
  interactive = false,
  className,
  children,
}: CardProps) {
  return (
    <Component
      className={cn(
        'bg-surface border-border-subtle rounded-xl border p-6',
        interactive &&
          'hover:bg-surface-hover hover:border-border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {children}
    </Component>
  );
}
