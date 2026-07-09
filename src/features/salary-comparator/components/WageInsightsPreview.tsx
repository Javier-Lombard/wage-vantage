import { Text } from '@/shared/components/ui';

import type { WageAggregation } from '../types';

interface WageInsightsPreviewProps {
  aggregation: WageAggregation | null;
  isLoading: boolean;
}

/**
 * Placeholder for the live boxplot — proves the cascade's aggregation data
 * reaches a sibling of SalaryForm without a render-body callback. The actual
 * Recharts boxplot (and the Monthly Wage ReferenceLine) is a separate,
 * larger task per the recharts skill's composed-pattern reference.
 */
export function WageInsightsPreview({ aggregation, isLoading }: WageInsightsPreviewProps) {
  if (isLoading) {
    return (
      <Text variant="body-sm" className="text-muted">
        Updating...
      </Text>
    );
  }

  if (!aggregation) {
    return (
      <Text variant="body-sm" className="text-muted">
        Choose a country to see salary insights.
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4 rounded-xl border border-border-subtle bg-surface p-6">
      {(['min', 'q1', 'median', 'q3', 'max'] as const).map((key) => (
        <div key={key} className="flex flex-col gap-1">
          <Text variant="body-sm" className="text-muted uppercase">
            {key}
          </Text>
          <Text variant="body-sm" className="text-foreground font-semibold">
            {aggregation[key].toLocaleString()}
          </Text>
        </div>
      ))}
    </div>
  );
}
