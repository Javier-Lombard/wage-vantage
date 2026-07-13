import { Lock } from 'lucide-react';
import { useCallback, useState } from 'react';

import { AuthFlowDialogs, AuthPromptDialog, useAuth } from '@/features/auth';
import { ExportButton } from '@/features/export';
import { PremiumGate } from '@/features/premium';
import {
  buildEnrichmentProfile,
  buildWageFilters,
  ComparisonCountryQuery,
} from '@/features/salary-comparator';
import { Button, Card, ErrorBoundary, Icon, Text } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/lib/toast';

import { OccupationSalaryBandsChart } from './OccupationSalaryBandsChart';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { SalaryGrowthChart } from './SalaryGrowthChart';
import { SaveComparisonDialog } from './SaveComparisonDialog';
import { SectorDistributionChart } from './SectorDistributionChart';

import type { WageAggregation } from '@/features/salary-comparator';

interface ComparisonSheetProps {
  /** País base primero, luego los extra elegidos en CompareCountryModal — 1 a 3 elementos. */
  countries: string[];
  /** País del usuario (de SalaryFormValues.country vía location.state) — resalta su badge. */
  primaryCountry?: string;
  /** De SalaryFormValues.monthlyWage — alimenta la línea "You" de SectorDistributionChart. */
  userWage?: number;
  /** Gatea el detalle numérico exacto — free/guest ven un placeholder en vez del chart real. */
  hasAccurateData: boolean;
  /**
   * Agregaciones ya calculadas de una comparación guardada (SavedComparison.
   * computedStats), en el mismo orden que `countries`. Si viene poblado, el
   * modo es "replay": se usa directamente como estado inicial y NO se monta
   * ningún ComparisonCountryQuery — los datos quedan congelados al momento
   * del guardado, sin refetch. Si es undefined (llegada desde el form), el
   * modo es "fetch en vivo", igual que antes. `null` en una posición marca un
   * país cuyo fetch no había resuelto al guardar.
   */
  initialAggregations?: (WageAggregation | null)[];
}

/** Sin datos del form completo en esta página (solo el nombre del país llega
 * vía location.state) — wage_monthly_wages devuelve el agregado nacional del
 * país, sin más filtros. Constante fuera del componente: mismo objeto en
 * cada render, evita disparar refetches por referencia inestable. */
const NO_FILTERS = buildWageFilters({});

/** Igual que NO_FILTERS: sin perfil de form que enviar al fallback de Gemini
 * en esta página — el enriquecimiento, si se dispara, describe solo el país. */
const NO_ENRICHMENT_PROFILE = buildEnrichmentProfile({});

interface PremiumChartFallbackProps {
  title: string;
}

/** Mismo footprint (título + cuerpo h-[260px]) que un chart real, para no romper el ritmo del grid. */
function PremiumChartFallback({ title }: PremiumChartFallbackProps) {
  return (
    <div className="flex flex-col gap-4">
      <Text variant="h4">{title}</Text>
      <div className="bg-surface-hover border-border-subtle flex h-65 flex-col items-center justify-center gap-2 rounded-lg border text-center">
        <Icon icon={Lock} size={24} className="text-muted" />
        <Text variant="body-sm" className="text-muted px-6">
          Upgrade to Premium for detailed data
        </Text>
      </div>
    </div>
  );
}

export function ComparisonSheet({
  countries,
  primaryCountry,
  userWage,
  hasAccurateData,
  initialAggregations,
}: ComparisonSheetProps) {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const saveDialog = useDisclosure();
  const authPrompt = useDisclosure();
  const authDialog = useDisclosure();
  // Modo "replay" (comparación guardada reabierta) vs "fetch en vivo" (llegada
  // desde el form) — decide si se montan los ComparisonCountryQuery más abajo.
  // Se fija en el primer render: si el usuario reabre esta misma URL/estado no
  // cambia de modo a mitad de sesión.
  const isReplayMode = initialAggregations !== undefined;
  // Agregaciones reales por país. En modo replay se inicializan una sola vez
  // desde initialAggregations (zip posicional con `countries`, mismo orden en
  // que se guardaron) y no vuelven a tocarse. En modo fetch arrancan vacías y
  // cada ComparisonCountryQuery las va rellenando vía onResult — mismo patrón
  // que SalaryCalculator/MainChart en la home.
  const [aggregations, setAggregations] = useState<Map<string, WageAggregation>>(() => {
    if (!initialAggregations) return new Map();
    const entries = countries
      .map((country, index): [string, WageAggregation | null | undefined] => [
        country,
        initialAggregations[index],
      ])
      .filter((entry): entry is [string, WageAggregation] => entry[1] != null);
    return new Map(entries);
  });

  // Memoizado: es dependencia del useEffect de notificación en cada
  // ComparisonCountryQuery — una referencia inestable lo re-dispararía en
  // cada render sin que el dato realmente cambiara.
  const handleComparisonResult = useCallback(
    (country: string, aggregation: WageAggregation | null) => {
      setAggregations((prev) => {
        const next = new Map(prev);
        if (aggregation) next.set(country, aggregation);
        else next.delete(country);
        return next;
      });
    },
    [],
  );

  const series = countries.map((country) => ({
    country,
    aggregation: aggregations.get(country) ?? null,
  }));

  // Auth gate: guest ve el upsell de login (mismo patrón que el save de
  // templates en SalaryCalculator); logueado va directo al form de guardado.
  const handleSaveClick = () => {
    if (isAuthenticated) {
      saveDialog.open();
    } else {
      authPrompt.open();
    }
  };

  const handleSaveComparison = async (name: string) => {
    if (!user) return;
    try {
      const newComparison = {
        id: crypto.randomUUID(),
        name,
        savedAt: new Date().toISOString(),
        selectedCountries: countries,
        primaryCountry,
        userWage,
        values: { country: primaryCountry, monthlyWage: userWage },
        // Mismo orden posicional que selectedCountries, SIN filtrar — así
        // ComparisonSheet puede hacer zip(countries, computedStats) por
        // índice al reabrir. `null` (no undefined, ver auth/types.ts) marca
        // un país que no había resuelto su fetch al guardar.
        computedStats: countries.map((country) => aggregations.get(country) ?? null),
      };
      await updateProfile({
        comparisons: [...(user.metadata.comparisons ?? []), newComparison],
      });
      toast.success('Comparison saved');
      saveDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save comparison.');
    }
  };

  const openAuthDialog = () => {
    authPrompt.close();
    authDialog.open();
  };

  return (
    <div className="flex flex-col gap-6">
      <Text variant="h2">Comparison Sheet</Text>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {countries.map((country) => {
            const isPrimary = country === primaryCountry;
            return (
              <span
                key={country}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm font-semibold',
                  isPrimary
                    ? 'border-primary bg-primary-muted text-primary'
                    : 'border-border-subtle bg-surface-hover text-foreground',
                )}
              >
                {country}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSaveClick}>
            Save
          </Button>
          <ExportButton onExport={() => {}} />
        </div>
      </div>

      {/* Modo replay: los datos ya vienen de computedStats, no se refetchea. */}
      {!isReplayMode &&
        countries.map((country) => (
          <ComparisonCountryQuery
            key={country}
            country={country}
            baseFilters={NO_FILTERS}
            enrichmentProfile={NO_ENRICHMENT_PROFILE}
            onResult={handleComparisonResult}
          />
        ))}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <PremiumGate
            hasAccess={hasAccurateData}
            fallback={<PremiumChartFallback title="Salary Distribution" />}
          >
            <ErrorBoundary>
              <SalaryDistributionChart series={series} userWage={userWage} />
            </ErrorBoundary>
          </PremiumGate>
        </Card>

        <Card>
          <ErrorBoundary>
            <SalaryGrowthChart countries={countries} />
          </ErrorBoundary>
        </Card>

        <Card>
          <ErrorBoundary>
            <SectorDistributionChart countries={countries} userWage={userWage} />
          </ErrorBoundary>
        </Card>

        <Card>
          <PremiumGate
            hasAccess={hasAccurateData}
            fallback={<PremiumChartFallback title="Occupation Salary Bands" />}
          >
            <ErrorBoundary>
              <OccupationSalaryBandsChart countries={countries} />
            </ErrorBoundary>
          </PremiumGate>
        </Card>
      </div>

      <SaveComparisonDialog
        isOpen={saveDialog.isOpen}
        onClose={saveDialog.close}
        onSave={(name) => void handleSaveComparison(name)}
      />

      <AuthPromptDialog
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.close}
        variant="log-in-to-save-comparison"
        onLogIn={openAuthDialog}
      />

      <AuthFlowDialogs isOpen={authDialog.isOpen} onClose={authDialog.close} />
    </div>
  );
}
