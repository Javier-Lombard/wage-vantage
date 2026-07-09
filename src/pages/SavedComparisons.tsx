import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '@/features/auth';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { BackButton, Text } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import {
  DeleteComparisonDialog,
  SavedComparisonsGrid,
  summarizeComparison,
} from '@/features/comparison';
import { useFeatureAccess } from '@/features/premium';

export function SavedComparisons() {
  const { limits } = useFeatureAccess();
  const { user, updateProfile } = useAuth();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const deleteDialog = useDisclosure();

  const comparisons = user?.metadata.comparisons ?? [];
  const comparisonSummaries = comparisons.map((comparison) => ({
    id: comparison.id,
    name: comparison.name,
    summary: summarizeComparison(comparison.values, comparison.selectedCountries),
  }));

  const handleDelete = async () => {
    try {
      await updateProfile({
        comparisons: comparisons.filter((comparison) => comparison.id !== pendingDeleteId),
      });
      deleteDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete comparison.');
    }
  };

  const handleView = (id: string) => {
    const comparison = comparisons.find((c) => c.id === id);
    if (!comparison) return;
    void navigate('/comparison', { state: { values: comparison.values } });
  };

  return (
    <div className="flex flex-col gap-8">
      <BackButton to="/dashboard" label="Back to dashboard" />

      <Text variant="h2">Saved Comparisons</Text>

      <SavedComparisonsGrid
        comparisons={comparisonSummaries}
        maxSavedComparisons={limits.maxSavedComparisons}
        onView={handleView}
        onDelete={(id) => {
          setPendingDeleteId(id);
          deleteDialog.open();
        }}
        onSaveNew={
          limits.maxSavedComparisons > comparisons.length ? () => void navigate('/') : undefined
        }
      />

      <DeleteComparisonDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onDelete={() => void handleDelete()}
      />
    </div>
  );
}
