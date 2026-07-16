import { useCallback } from 'react';

import type { RefObject } from 'react';

/**
 * Hace scroll suave hacia `ref.current`, saltándose el scroll si el borde
 * SUPERIOR del elemento ya está dentro del viewport — evita un scroll
 * innecesario en layouts donde el elemento ya es visible sin mover la página
 * (p. ej. desktop con grid de columnas lado a lado). No basta con "algo del
 * elemento asoma": tras bajar a rellenar un form largo, el borde inferior de
 * una chart alta puede seguir asomando arriba del viewport aunque el 80% de
 * su contenido esté fuera de vista — por eso el criterio es sobre `rect.top`
 * (el punto que `block: 'start'` intenta alinear), no sobre `rect.bottom`.
 * Respeta prefers-reduced-motion: si el usuario lo activó, el salto es
 * instantáneo en vez de animado.
 */
export function useScrollToElement(ref: RefObject<HTMLElement | null>) {
  return useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const isTopAlreadyVisible = rect.top >= 0 && rect.top < window.innerHeight;
    if (isTopAlreadyVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [ref]);
}
