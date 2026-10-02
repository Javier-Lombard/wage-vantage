import { useState } from 'react';

/**
 * Reinicia el estado local de un diálogo cada vez que pasa de cerrado a
 * abierto. Los diálogos siguen montados mientras están cerrados (Modal solo
 * devuelve null), así que sin esto conservan lo escrito en la apertura
 * anterior y un `initialX` solo se lee en el primer montaje. Se compara
 * `isOpen` durante el render en vez de usar useEffect: el reset se aplica
 * antes de pintar, sin un frame con datos viejos ni un render extra.
 */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) reset();
  }
}
