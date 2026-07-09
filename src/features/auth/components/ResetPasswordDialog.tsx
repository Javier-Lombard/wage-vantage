import { useState } from 'react';
import { Lock } from 'lucide-react';

import { ActionDialog, Input } from '@/shared/components/ui';

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

export function ResetPasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ResetPasswordDialogProps) {
  const [email, setEmail] = useState('');

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Lock}
      title="Reset your password"
      description="Enter your email and we'll send you a link to reset your password."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Send reset link', onClick: () => onSubmit(email), isLoading }}
    >
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
    </ActionDialog>
  );
}
