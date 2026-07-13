import type { WageAggregation } from '../types';

/**
 * TABLE_0 bebe de datos estadísticos con errores: contiene outliers absurdos
 * (p.ej. en Francia aparecen 23.738.301, 1.000.000.000 o 23.399.999.488 €/mes)
 * que destrozan la media y los percentiles. También arrastra registros de
 * algún país en moneda local sin convertir (Dinamarca mezcla EUR con coronas
 * danesas, que arrancan sobre los 16.000). Descartar todo lo que supere este
 * tope limpia ambos problemas de un plumazo antes de agregar.
 *
 * 15.000 es una decisión arbitraria, no un valor derivado estadísticamente
 * (percentil, IQR, etc.) — se fijó a ojo tras inspeccionar la muestra de
 * Francia, igual que el tope de 13.000 que tenía el proyecto anterior a este.
 * Si se ajusta en el futuro, revisar en conjunto con el rango que ya asume
 * enrich-salary-data/index.ts (Edge Function, no versionada en este repo):
 * esa función le pide a Gemini valores "200 to 50000" y trata su propio `max`
 * como el percentil 95 realista. Un MAX_PLAUSIBLE_WAGE muy por debajo de ese
 * rango sesga la muestra "real" hacia abajo frente a la estimación con la que
 * luego se fusiona (mergeAggregations.ts); uno muy por encima deja pasar los
 * mismos outliers que se busca cortar.
 */
export const MAX_PLAUSIBLE_WAGE = 15000;

/** Linear-interpolation percentile (matches Excel/numpy's default method). */
function percentile(sorted: number[], p: number): number {
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Salarios dentro del rango plausible. Se exporta aparte de aggregateWages
 * para que el endpoint mida el tamaño de muestra sobre el conteo YA truncado
 * (los outliers no deben rellenar la muestra ni ocultar que hay pocos datos
 * reales) sin duplicar el criterio de filtrado.
 */
export function plausibleWages(monthlyWages: number[] | undefined): number[] {
  if (!monthlyWages) return [];
  return monthlyWages.filter((wage) => wage <= MAX_PLAUSIBLE_WAGE);
}

/**
 * Deriva min/Q1/median/Q3/max del array de salarios, descartando antes los
 * outliers no plausibles. Función pura reutilizable: la envuelve useWageStats
 * (para el render) y la llama el queryFn de wageApi (para agregar la muestra
 * pequeña antes de fusionarla con la estimación de Gemini) — un hook no puede
 * invocarse dentro de un queryFn, de ahí que la lógica viva aquí y no en el
 * propio useWageStats.
 */
export function aggregateWages(monthlyWages: number[] | undefined): WageAggregation | null {
  const filtered = plausibleWages(monthlyWages);
  if (filtered.length === 0) return null;

  const sorted = [...filtered].sort((a, b) => a - b);
  return {
    min: sorted[0],
    q1: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    q3: percentile(sorted, 0.75),
    max: sorted[sorted.length - 1],
  };
}
