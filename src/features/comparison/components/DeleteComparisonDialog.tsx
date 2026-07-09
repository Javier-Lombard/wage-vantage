import { AlertTriangle } from 'lucide-react';

import { ActionDialog } from '@/shared/components/ui';

interface DeleteComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteComparisonDialog({
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
}: DeleteComparisonDialogProps) {
  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertTriangle}
      tone="destructive"
      title="Delete saved comparison?"
      description="This action cannot be undone. You will lose all data associated with this comparison."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Delete', onClick: onDelete, isLoading }}
    />
  );
}
