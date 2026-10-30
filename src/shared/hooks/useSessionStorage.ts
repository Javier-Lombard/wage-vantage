import { useEffect, useState } from 'react';

import type { Dispatch, SetStateAction } from 'react';

interface UseSessionStorageOptions<T> {
  /**
   * Valida y normaliza lo leído de sessionStorage — devuelve undefined para
   * descartarlo. Lo guardado puede venir de una versión anterior del shape o
   * haberse editado a mano desde DevTools, así que nunca se confía en él tal cual.
   */
  parse: (stored: unknown) => T | undefined;
  /** Gana sobre lo guardado — p. ej. un prefill explícito que debe pisar la sesión anterior. */
  override?: T;
}

function readStored<T>(key: string, parse: (stored: unknown) => T | undefined): T | undefined {
  // getItem/JSON.parse pueden lanzar (storage bloqueado en modo privado,
  // JSON corrupto): en ese caso se arranca como si no hubiera nada guardado.
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return undefined;

    const stored: unknown = JSON.parse(raw);
    return parse(stored);
  } catch {
    return undefined;
  }
}

/**
 * useState respaldado por sessionStorage: el valor sobrevive al desmontaje
 * del componente (navegar a otra ruta y volver) y a una recarga de la
 * pestaña, pero no se comparte con otras pestañas ni sobrevive a cerrarla —
 * el alcance justo para estado en curso que no es del usuario (ver
 * CLAUDE.md §State management). Solo se lee en el montaje; después la
 * fuente de verdad es el estado de React y el storage es un espejo.
 */
export function useSessionStorage<T>(
  key: string,
  fallback: T,
  { parse, override }: UseSessionStorageOptions<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => override ?? readStored(key, parse) ?? fallback);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Un fallo al escribir (cuota llena, storage bloqueado) solo pierde la
      // persistencia; el estado en memoria sigue funcionando igual.
    }
  }, [key, value]);

  return [value, setValue];
}
