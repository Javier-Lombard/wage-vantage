import { useFeatureAccess } from '@/features/premium';
import { useSessionStorage } from '@/shared/hooks/useSessionStorage';

export type ComparisonGate = 'none' | 'login' | 'upgrade';

const EXTRA_COUNTRIES_STORAGE_KEY = 'salary-comparator:extra-countries';

function parseStoredCountries(stored: unknown): string[] | undefined {
  if (!Array.isArray(stored)) return undefined;

  const countries: unknown[] = stored;
  return countries.filter((country): country is string => typeof country === 'string');
}

/**
 * Dueño del estado de "países extra en comparación" y de la política de
 * gate free-vs-premium — no dispara fetches (eso lo hace un
 * ComparisonCountryQuery por país, montado por el caller), solo decide
 * cuántos países caben y qué diálogo abrir al exceder el límite.
 *
 * maxCountries es el TOTAL (1 del form + N extra, ver premium/config.ts),
 * así que se compara contra `1 + extraCountries.length`. Guest y free
 * comparten límite (2); el gate solo distingue a quién mostrarle qué
 * diálogo — login para que un guest se identifique, upgrade para que un
 * free suba de plan.
 *
 * La lista se guarda en sessionStorage junto con el form (useSalaryFormState):
 * cada ComparisonCountryQuery vuelve a montarse con sus mismos args al volver
 * a la home y RTK Query sirve los países extra desde caché.
 */
export function useCountryComparison() {
  const { tier, limits } = useFeatureAccess();
  const [extraCountries, setExtraCountries] = useSessionStorage<string[]>(
    EXTRA_COUNTRIES_STORAGE_KEY,
    [],
    { parse: parseStoredCountries },
  );

  const totalCountries = 1 + extraCountries.length;
  const canAddMore = totalCountries < limits.maxCountries;
  const gateOnLimit: ComparisonGate =
    tier === 'guest' ? 'login' : tier === 'free' ? 'upgrade' : 'none';

  const addCountry = (country: string): ComparisonGate => {
    if (extraCountries.includes(country)) return 'none';
    if (!canAddMore) return gateOnLimit;

    setExtraCountries((prev) => [...prev, country]);
    return 'none';
  };

  const removeCountry = (country: string) => {
    setExtraCountries((prev) => prev.filter((c) => c !== country));
  };

  return { extraCountries, addCountry, removeCountry, canAddMore, gateOnLimit };
}
