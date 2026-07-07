import { Card, Text } from '@/shared/components/ui';
import { MainChart } from '@/features/salary-calculator';

import type { WageAggregation } from '@/features/salary-calculator';

interface ComparisonSheetProps {
  name: string;
  countries: string[];
  aggregation: WageAggregation | null;
  isLoading: boolean;
  /** Gatea el detalle numérico exacto (min/Q1/mediana/Q3/max) — free/guest solo ven el gráfico. */
  hasAccurateData: boolean;
}

export function ComparisonSheet({
  name,
  countries,
  aggregation,
  isLoading,
  hasAccurateData,
}: ComparisonSheetProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Text variant="h3">{name}</Text>
        <Text variant="body-sm" className="text-muted">
          {countries.join(' vs ')}
        </Text>
      </div>

      <Card>
        <MainChart aggregation={aggregation} isLoading={isLoading} hasStarted />
      </Card>

      {hasAccurateData && aggregation && (
        <Card className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(
            [
              ['Min', aggregation.min],
              ['Q1', aggregation.q1],
              ['Median', aggregation.median],
              ['Q3', aggregation.q3],
              ['Max', aggregation.max],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <Text variant="caption">{label}</Text>
              <Text variant="h5">{value.toLocaleString()}</Text>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
