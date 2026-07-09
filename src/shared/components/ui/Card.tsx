import { cn } from '@/shared/lib/cn';

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

interface CardOwnProps {
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Superficie elevada genérica (DESIGN.md §7: bg-surface, border-subtle,
 * rounded-xl/2xl, p-6) — reemplaza el div inline repetido en cards, paneles
 * y secciones de todo el mock. `interactive` añade el hover/focus propio de
 * una card clicable (dashboard, plan cards) sin forzar un <button>/<a>: el
 * elemento real lo decide el caller vía `as`.
 *
 * Polimórfico: cualquier prop del elemento elegido (p. ej. `to` de
 * react-router's `Link`, `onClick` de `button`, `href` de `a`) se reenvía sin
 * necesidad de declararla aquí una por una.
 */
type CardProps<T extends ElementType> = CardOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps | 'as'>;

export function Card<T extends ElementType = 'div'>({
  as,
  interactive = false,
  className,
  children,
  ...props
}: CardProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component
      className={cn(
        'bg-surface border-border-subtle rounded-xl border p-6',
        interactive &&
          'hover:bg-surface-hover hover:border-border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
