import { ArrowLeftRight } from 'lucide-react';

import { Button, Icon, Text } from '@/shared/components/ui';
import { ComparisonCard } from './ComparisonCard';

export interface ComparisonSummary {
  id: string;
  name: string;
  summary: string;
}

interface SavedComparisonsGridProps {
  comparisons: ComparisonSummary[];
  maxSavedComparisons: number;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  /** Se oculta cuando ya se alcanzó el límite del tier — el gating lo decide el caller. */
  onSaveNew?: () => void;
}

export function SavedComparisonsGrid({
  comparisons,
  maxSavedComparisons,
  onView,
  onDelete,
  onSaveNew,
}: SavedComparisonsGridProps) {
  const canSaveMore = comparisons.length < maxSavedComparisons && onSaveNew;

  if (comparisons.length === 0) {
    return (
      <div className="border-border-subtle flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <Icon icon={ArrowLeftRight} size={24} className="text-muted" />
        <Text variant="body" className="text-muted">
          No saved comparisons yet.
        </Text>
        {onSaveNew && <Button onClick={onSaveNew}>Save your first comparison</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {comparisons.map((comparison) => (
          <ComparisonCard
            key={comparison.id}
            name={comparison.name}
            summary={comparison.summary}
            onView={() => onView(comparison.id)}
            onDelete={() => onDelete(comparison.id)}
          />
        ))}
      </div>
      {canSaveMore && (
        <Button variant="outline" onClick={onSaveNew} className="self-start">
          Save new comparison ({comparisons.length}/{maxSavedComparisons})
        </Button>
      )}
    </div>
  );
}
