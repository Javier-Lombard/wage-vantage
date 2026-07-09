import { useCallback, useState } from 'react';

interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Estado open/close/toggle reutilizado por cada trigger de modal/diálogo
 * (ActionDialog y sus variantes por feature). `useCallback` evita que un
 * cambio de estado invalide referencias pasadas como props a componentes
 * memoizados.
 */
export function useDisclosure(initialIsOpen = false): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
