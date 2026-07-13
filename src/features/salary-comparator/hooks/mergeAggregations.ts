import type { WageAggregation } from '../types';

/**
 * Combina dos WageAggregation ya computadas (los pocos salarios reales de
 * TABLE_0 y la estimación de Gemini) con la media simple de cada percentil
 * homólogo — sin sintetizar un array de puntos y re-percentilizarlo, que
 * fabricaría datos que no son ni reales ni la estimación del modelo.
 *
 * La media percentil-a-percentil de dos secuencias monótonas es en teoría
 * siempre monótona, pero se aplica un clamp defensivo por si el redondeo o
 * una entrada casi-degenerada de alguna de las dos fuentes rompe el orden:
 * MainChart asume min<=q1<=median<=q3<=max para dibujar la caja.
 */
export function mergeAggregations(
  real: WageAggregation,
  estimate: WageAggregation,
): WageAggregation {
  const min = (real.min + estimate.min) / 2;
  const q1 = Math.max((real.q1 + estimate.q1) / 2, min);
  const median = Math.max((real.median + estimate.median) / 2, q1);
  const q3 = Math.max((real.q3 + estimate.q3) / 2, median);
  const max = Math.max((real.max + estimate.max) / 2, q3);

  return { min, q1, median, q3, max };
}
