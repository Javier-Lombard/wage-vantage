import { useState } from 'react';

import { Button, Card, Input, Text } from '@/shared/components/ui';

import { AvatarField } from './AvatarField';

export interface UserSettingsValues {
  name: string;
  email: string;
  password: string;
  avatarFile: File | null;
}

interface UserSettingsPanelProps {
  initialName: string;
  initialEmail: string;
  onSave: (values: UserSettingsValues) => void;
  isLoading?: boolean;
}

export function UserSettingsPanel({
  initialName,
  initialEmail,
  onSave,
  isLoading = false,
}: UserSettingsPanelProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Text variant="h4">Account Settings</Text>
        <Text variant="body-sm" className="text-muted">
          Update your profile, email and password.
        </Text>
      </div>

      <div className="flex flex-col gap-4">
        <AvatarField onChange={setAvatarFile} />

        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Leave blank to keep your current password"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave({ name, email, password, avatarFile })} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}
