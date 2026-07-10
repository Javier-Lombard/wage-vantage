import { useLocation } from 'react-router';

import { ComparisonSheet } from '@/features/comparison';
import { useFeatureAccess } from '@/features/premium';
import { BackButton } from '@/shared/components/ui';

import type { SalaryFormValues, WageAggregation } from '@/features/salary-comparator';

export function ComparisonPage() {
  const { can } = useFeatureAccess();
  const location = useLocation();
  // location.state llega como `any` desde react-router — el shape solo lo garantiza
  // los dos orígenes posibles: SalaryCalculator.handleSubmit (fetch en vivo, sin
  // computedStats) y SavedComparisons.handleView (replay, con computedStats). Acceso
  // directo a /comparison (sin pasar por ninguno) deja state en null.
  const state = location.state as {
    values?: SalaryFormValues;
    extraCountries?: string[];
    computedStats?: (WageAggregation | null)[];
  } | null;

  const primaryCountry = state?.values?.country;
  const userWage = state?.values?.monthlyWage;
  // País base primero, luego los extra elegidos en CompareCountryModal — mismo
  // orden que `series` en SalaryCalculator/MainChart. Sin país base no hay
  // comparación posible (acceso directo a /comparison), así que se omiten
  // los extra también en ese caso.
  const countries = primaryCountry ? [primaryCountry, ...(state?.extraCountries ?? [])] : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <ComparisonSheet
        countries={countries}
        primaryCountry={primaryCountry}
        userWage={userWage}
        hasAccurateData={can('accurateData')}
        initialAggregations={state?.computedStats}
      />
    </main>
  );
}
