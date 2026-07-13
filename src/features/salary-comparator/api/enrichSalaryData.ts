import { supabase } from '@/shared/lib/supabaseClient';

import type { EnrichSalaryResponse } from './wageApi.types';
import type { WageAggregation } from '../types';

/**
 * supabase.functions.invoke<T> tipa T como `any` por defecto — a diferencia
 * de .rpc(), no hay tipos generados para Edge Functions. Se invoca con
 * <unknown> explícito y se estrecha aquí con un type guard, el único punto
 * del feature que toca supabase.functions (SoC: los componentes no lo ven).
 */
function isEnrichSalaryResponse(value: unknown): value is EnrichSalaryResponse {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  const numericKeys = ['min', 'q1', 'median', 'q3', 'max'] as const;

  return (
    typeof candidate.category === 'string' &&
    numericKeys.every((key) => typeof candidate[key] === 'number' && Number.isFinite(candidate[key]))
  );
}

/**
 * Invoca la Edge Function enrich-salary-data (ya desplegada, no se modifica
 * aquí) y devuelve su estimación como WageAggregation, descartando
 * `category`. Lanza si la invocación falla (red, 4xx/5xx del servidor — p.ej.
 * país fuera de los 11 que valida la función) o si la respuesta no tiene el
 * shape esperado, para que el queryFn de wageApi propague el error en vez de
 * degradar en silencio.
 */
export async function invokeEnrichSalaryData(
  country: string,
  formValues: Record<string, string>,
): Promise<WageAggregation> {
  // FunctionsResponseFailure tipa `error` como `any` en @supabase/functions-js
  // (types.ts) — se evita desestructurarlo junto a `data` para no colar ese
  // `any` en el scope; se lee como propiedad y se estrecha a `unknown` antes
  // de usarlo.
  const response = await supabase.functions.invoke<unknown>('enrich-salary-data', {
    body: { country, formValues },
  });

  const invokeError: unknown = response.error;
  if (invokeError) {
    throw invokeError instanceof Error
      ? invokeError
      : new Error('enrich-salary-data invocation failed');
  }

  if (!isEnrichSalaryResponse(response.data)) {
    throw new Error('Malformed response from enrich-salary-data');
  }

  const { min, q1, median, q3, max } = response.data;
  return { min, q1, median, q3, max };
}
