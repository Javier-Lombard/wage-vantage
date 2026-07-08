import { ComparisonSheet } from '@/features/comparison';
import { useFeatureAccess } from '@/features/premium';
import { BackButton } from '@/shared/components/ui';

import type { WageAggregation } from '@/features/salary-calculator';

const MOCK_AGGREGATION: WageAggregation = {
  min: 1800,
  q1: 2400,
  median: 2950,
  q3: 3600,
  max: 5200,
};

export function ComparisonPage() {
  const { can } = useFeatureAccess();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <ComparisonSheet
        name="Spain vs Germany"
        countries={['Spain', 'Germany']}
        aggregation={MOCK_AGGREGATION}
        isLoading={false}
        hasAccurateData={can('accurateData')}
      />
    </main>
  );
}
