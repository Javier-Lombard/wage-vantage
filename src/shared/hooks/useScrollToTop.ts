import { useCallback } from 'react';

import type { RefObject } from 'react';

/**
 * Hace scroll suave hasta arriba del todo de la página (header incluido),
 * saltándose el scroll si el borde SUPERIOR de `ref.current` ya está dentro
 * del viewport — evita un scroll innecesario en layouts donde el elemento ya
 * es visible sin mover la página (p. ej. desktop con grid de columnas lado a
 * lado). No usa scrollIntoView: eso solo alinearía el borde del elemento con
 * el borde del viewport, dejando el header/navbar fuera de vista, que es
 * justo lo que se quiere recuperar. Respeta prefers-reduced-motion: si el
 * usuario lo activó, el salto es instantáneo en vez de animado.
 */
export function useScrollToTop(ref: RefObject<HTMLElement | null>) {
  return useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const isTopAlreadyVisible = rect.top >= 0 && rect.top < window.innerHeight;
    if (isTopAlreadyVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [ref]);
}
