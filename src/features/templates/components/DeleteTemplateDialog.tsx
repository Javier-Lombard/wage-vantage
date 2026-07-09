import { AlertTriangle } from 'lucide-react';

import { ActionDialog } from '@/shared/components/ui';

interface DeleteTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteTemplateDialog({
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
}: DeleteTemplateDialogProps) {
  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertTriangle}
      tone="destructive"
      title="Delete saved template?"
      description="This action cannot be undone. You will lose all data associated with this template."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Delete', onClick: onDelete, isLoading }}
    />
  );
}
