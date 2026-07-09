import { useState } from 'react';
import { Bookmark } from 'lucide-react';

import { ActionDialog, Input } from '@/shared/components/ui';

interface SaveComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading?: boolean;
}

export function SaveComparisonDialog({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: SaveComparisonDialogProps) {
  const [name, setName] = useState('');

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Bookmark}
      title="Save Comparison Sheet"
      description="Give this comparison a name so you can find it later in your saved comparisons."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Save', onClick: () => onSave(name), isLoading }}
    >
      <Input
        label="Comparison Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Senior SWE - London vs Berlin"
      />
    </ActionDialog>
  );
}
