import { useLocation } from 'react-router';

import { ComparisonSheet } from '@/features/comparison';
import { useFeatureAccess } from '@/features/premium';
import { BackButton } from '@/shared/components/ui';

import type { SalaryFormValues } from '@/features/salary-calculator';

export function ComparisonPage() {
  const { can } = useFeatureAccess();
  const location = useLocation();
  // location.state llega como `any` desde react-router — el shape solo lo garantiza
  // el navigate() de SalaryCalculator.handleSubmit, no el sistema de tipos. Acceso
  // directo a /comparison (sin pasar por el form) deja state en null.
  const state = location.state as { values?: SalaryFormValues } | null;

  const primaryCountry = state?.values?.country;
  const userWage = state?.values?.monthlyWage;

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <ComparisonSheet
        countries={['Spain', 'Germany']}
        primaryCountry={primaryCountry}
        userWage={userWage}
        hasAccurateData={can('accurateData')}
      />
    </main>
  );
}
