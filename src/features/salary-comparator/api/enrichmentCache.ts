import { invokeEnrichSalaryData } from './enrichSalaryData';
import { isWageAggregation } from './isWageAggregation';

import type { WageAggregation } from '../types';

const ENRICHMENT_STORAGE_PREFIX = 'salary-comparator:enrichment:';

/**
 * Perfil con las claves ordenadas: el orden de inserción en
 * buildEnrichmentProfile no debe generar entradas distintas para el mismo
 * perfil.
 */
function buildCacheKey(country: string, profile: Record<string, string>): string {
  const entries = Object.entries(profile).sort(([a], [b]) => a.localeCompare(b));
  return ENRICHMENT_STORAGE_PREFIX + JSON.stringify([country, entries]);
}

function readCachedEstimate(key: string): WageAggregation | undefined {
  // getItem/JSON.parse pueden lanzar (storage bloqueado, JSON corrupto): se
  // trata como si no hubiera nada guardado y se vuelve a llamar a Gemini.
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return undefined;

    const stored: unknown = JSON.parse(raw);
    return isWageAggregation(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedEstimate(key: string, estimate: WageAggregation): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(estimate));
  } catch {
    // Un fallo al escribir (cuota llena, storage bloqueado) solo pierde la
    // caché; la estimación recién obtenida se devuelve igual.
  }
}

/**
 * invokeEnrichSalaryData con memoria en sessionStorage por país + perfil.
 * La caché de RTK Query (getWageInsights) vive en memoria y caduca a los
 * 300 s, así que un F5 o volver a la home tarde re-invocaba a Gemini — que
 * además no es determinista y podía cambiar los números de la chart para los
 * mismos datos. Aquí dura lo que la pestaña.
 *
 * Se guarda la estimación cruda de Gemini, no el resultado ya fusionado:
 * mergeAggregations se recalcula en cada queryFn con los salarios reales del
 * momento. Los errores nunca se guardan — si Gemini falla, el siguiente
 * intento vuelve a llamarlo.
 */
export async function getEnrichmentEstimate(
  country: string,
  profile: Record<string, string>,
): Promise<WageAggregation> {
  const key = buildCacheKey(country, profile);

  const cached = readCachedEstimate(key);
  if (cached) return cached;

  const estimate = await invokeEnrichSalaryData(country, profile);
  writeCachedEstimate(key, estimate);

  return estimate;
}
