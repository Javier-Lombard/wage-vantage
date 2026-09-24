import { useGetWageInsightsQuery } from '../api/wageApi';
import { SALARY_FORM_FIELDS } from '../components/fieldConfig';
import { buildEnrichmentProfile } from './buildEnrichmentProfile';
import { buildWageFilters } from './buildWageFilters';

import type { SalaryFormValues } from '../types';

/**
 * Halla el índice del último campo filtrable con valor, y a partir de ahí el
 * siguiente campo combobox-fetched-options — ese es el que debe recibir las
 * opciones de esta fetch. Los filtros en sí los arma buildWageFilters
 * (compartido con useCountryComparison); esto solo añade la noción de
 * cascada, propia del form principal.
 */
function findNextOptionsField(values: SalaryFormValues) {
  let lastFilledIndex = -1;

  SALARY_FORM_FIELDS.forEach((field, index) => {
    if (field.kind !== 'combobox-fetched-options' && field.kind !== 'combobox-static-but-filters') {
      return;
    }
    const value = values[field.id];
    if (typeof value !== 'string' || value === '') return;

    lastFilledIndex = index;
  });

  if (lastFilledIndex === -1) return undefined;

  return SALARY_FORM_FIELDS.slice(lastFilledIndex + 1).find(
    (field) => field.kind === 'combobox-fetched-options',
  )?.filterColumn;
}

function buildCascadeQuery(values: SalaryFormValues) {
  const filters = buildWageFilters(values);
  if (Object.keys(filters).length === 0) return null;

  return {
    filters,
    nextOptionsField: findNextOptionsField(values),
    enrichmentProfile: buildEnrichmentProfile(values),
  };
}

/**
 * Consulta viva de cascada — re-deriva los filtros acumulados a partir de
 * `values` en cada render y vuelve a pedir los datos usando la propia caché
 * de RTK Query cuando cambian. Se omite por completo hasta que se elige al
 * menos un campo filtrable (País), según el encargo: nada se pide antes de eso.
 *
 * Devuelve `nextOptionsField` junto al resultado de la consulta para que
 * quien la llame sepa a qué campo pertenecen realmente las `data.options` —
 * todos los campos combobox-fetched-options del mismo paso comparten esta
 * única consulta, pero solo el campo cuyo filterColumn coincide con
 * `nextOptionsField` es el destinatario activo; un campo hermano ya
 * contestado no debe renderizar estas opciones como propias (ver SalaryFormField).
 */
export function useWageInsights(values: SalaryFormValues) {
  const cascadeQuery = buildCascadeQuery(values);

  const query = useGetWageInsightsQuery(cascadeQuery ?? { filters: {} }, {
    skip: cascadeQuery === null,
  });

  return { ...query, nextOptionsField: cascadeQuery?.nextOptionsField };
}
