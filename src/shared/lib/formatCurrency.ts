const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un importe en euros con coma decimal (es-ES), p.ej. `2,99€`. */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_FORMATTER.format(amount)}€`;
}
