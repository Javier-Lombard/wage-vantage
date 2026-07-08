import { useState } from 'react';

import { DangerZonePanel, UserSettingsPanel } from '@/features/auth';
import { Text } from '@/shared/components/ui';

export function UserSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <Text variant="h2">Account Settings</Text>

      <UserSettingsPanel
        initialName="Jane Doe"
        initialEmail="user@example.com"
        isLoading={isSaving}
        onSave={() => {
          setIsSaving(true);
          setTimeout(() => setIsSaving(false), 800);
        }}
      />

      <DangerZonePanel
        isLoading={isDeleting}
        onDeleteAccount={() => {
          setIsDeleting(true);
          setTimeout(() => setIsDeleting(false), 800);
        }}
      />
    </div>
  );
}
