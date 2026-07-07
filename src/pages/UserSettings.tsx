import { useState } from 'react';

import { UserSettingsPanel } from '@/features/auth';
import { Text } from '@/shared/components/ui';

export function UserSettings() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <Text variant="h2">Account Settings</Text>

      <UserSettingsPanel
        initialEmail="user@example.com"
        isLoading={isSaving}
        onSave={() => {
          setIsSaving(true);
          setTimeout(() => setIsSaving(false), 800);
        }}
      />
    </div>
  );
}
