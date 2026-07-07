import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { Text } from '@/shared/components/ui';
import {
  DeleteComparisonDialog,
  SaveComparisonDialog,
  SavedComparisonsGrid,
  type ComparisonSummary,
} from '@/features/comparison';
import { useFeatureAccess } from '@/features/premium';

const INITIAL_COMPARISONS: ComparisonSummary[] = [
  { id: '1', name: 'Spain vs Germany', summary: 'Software Engineer · 2 countries' },
];

export function SavedComparisons() {
  const { limits } = useFeatureAccess();
  const [comparisons, setComparisons] = useState(INITIAL_COMPARISONS);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const saveDialog = useDisclosure();
  const deleteDialog = useDisclosure();

  return (
    <div className="flex flex-col gap-8">
      <Text variant="h2">Saved Comparisons</Text>

      <SavedComparisonsGrid
        comparisons={comparisons}
        maxSavedComparisons={limits.maxSavedComparisons}
        onView={(id) => void navigate(`/comparison?id=${id}`)}
        onDelete={(id) => {
          setPendingDeleteId(id);
          deleteDialog.open();
        }}
        onSaveNew={limits.maxSavedComparisons > 0 ? saveDialog.open : undefined}
      />

      <SaveComparisonDialog
        isOpen={saveDialog.isOpen}
        onClose={saveDialog.close}
        onSave={(name) => {
          setComparisons((prev) => [...prev, { id: crypto.randomUUID(), name, summary: '' }]);
          saveDialog.close();
        }}
      />

      <DeleteComparisonDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onDelete={() => {
          setComparisons((prev) => prev.filter((comparison) => comparison.id !== pendingDeleteId));
          deleteDialog.close();
        }}
      />
    </div>
  );
}
