import { useState } from 'react';
import { Bookmark } from 'lucide-react';

import { ActionDialog, Input } from '@/shared/components/ui';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading?: boolean;
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('');

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Bookmark}
      title="Save as Template"
      description="Give this comparison a name so you can easily access it later."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Save Template', onClick: () => onSave(name), isLoading }}
    >
      <Input
        label="Template Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Senior SWE - London vs Berlin"
      />
    </ActionDialog>
  );
}
