import { useState } from 'react';

import { DangerZonePanel, UserSettingsPanel, useAuth } from '@/features/auth';
import { uploadAvatar } from '@/features/auth/lib/uploadAvatar';
import { BackButton, Text } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

import type { UserSettingsValues } from '@/features/auth';

export function UserSettings() {
  const { user, updateProfile, updateCredentials, deleteAccount } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async ({ name, email, password, avatarFile }: UserSettingsValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const avatarUrl = avatarFile ? await uploadAvatar(user.id, avatarFile) : undefined;

      await updateProfile({
        name,
        ...(avatarUrl && { avatarUrl }),
      });

      const authUpdate: { email?: string; password?: string } = {};
      if (email !== user.email) authUpdate.email = email;
      if (password) authUpdate.password = password;
      if (Object.keys(authUpdate).length > 0) await updateCredentials(authUpdate);

      toast.success('Settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <BackButton to="/dashboard" label="Back to dashboard" />

      <Text variant="h2">Account Settings</Text>

      <UserSettingsPanel
        initialName={user?.metadata.name ?? ''}
        initialEmail={user?.email ?? ''}
        initialAvatarUrl={user?.metadata.avatarUrl}
        isLoading={isSaving}
        onSave={(values) => void handleSave(values)}
      />

      <DangerZonePanel isLoading={isDeleting} onDeleteAccount={() => void handleDeleteAccount()} />
    </div>
  );
}
