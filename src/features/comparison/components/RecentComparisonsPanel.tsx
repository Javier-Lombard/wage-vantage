import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router';

import { Card, Icon, Text } from '@/shared/components/ui';

interface RecentComparisonsPanelProps {
  savedComparisonsCount: number;
}

/**
 * Panel del dashboard principal (no la grid completa de SavedComparisons —
 * esa vive en /dashboard/comparisons). Este panel solo resume y enlaza allí.
 */
export function RecentComparisonsPanel({ savedComparisonsCount }: RecentComparisonsPanelProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Text variant="h4">Recent Comparisons</Text>
          <Text variant="body-sm" className="text-muted">
            You have {savedComparisonsCount} saved comparisons.
          </Text>
        </div>
        <Link
          to="/dashboard/comparisons"
          className="text-primary text-sm font-semibold hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="border-border-subtle flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <Icon icon={BarChart3} size={24} className="text-muted" />
        <Text variant="body-sm" className="text-muted">
          No recent chart data available.
        </Text>
      </div>
    </Card>
  );
}
