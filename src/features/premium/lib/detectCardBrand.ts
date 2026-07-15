/**
 * Detección cosmética por prefijo — suficiente para un mock sin procesador
 * real detrás (nada de esto se transmite, solo se guarda como { brand,
 * last4, expiry } en user_metadata). No es una validación BIN real.
 */
export function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(digits)) {
    return 'Mastercard';
  }
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
}
