import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router';

import { Card, Icon, Text } from '@/shared/components/ui';

import { summarizeComparison } from '../lib/summarizeComparison';

import type { SavedComparison } from '@/features/auth';

interface RecentComparisonsPanelProps {
  savedComparisonsCount: number;
  recentComparisons: SavedComparison[];
}

/** Cuántos items del array se muestran antes de mandar a "View all". */
const MAX_VISIBLE_ITEMS = 3;

/**
 * Panel del dashboard principal (no la grid completa de SavedComparisons —
 * esa vive en /dashboard/comparisons). Este panel solo resume y enlaza allí.
 */
export function RecentComparisonsPanel({
  savedComparisonsCount,
  recentComparisons,
}: RecentComparisonsPanelProps) {
  const items = recentComparisons.slice(0, MAX_VISIBLE_ITEMS);

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
          className="text-accent-fg text-sm font-semibold hover:underline"
        >
          View all →
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((comparison) => (
            <li key={comparison.id}>
              <Link
                to="/comparison"
                state={{ values: comparison.values }}
                className="border-border-subtle hover:bg-surface-hover flex flex-col gap-0.5 rounded-lg border p-3 transition-colors"
              >
                <Text variant="body-sm" className="text-foreground font-semibold">
                  {comparison.name}
                </Text>
                <Text variant="body-sm" className="text-muted">
                  {summarizeComparison(comparison.values, comparison.selectedCountries)}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-border-subtle flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <Icon icon={BarChart3} size={24} className="text-muted" />
          <Text variant="body-sm" className="text-muted">
            No recent chart data available.
          </Text>
        </div>
      )}
    </Card>
  );
}
