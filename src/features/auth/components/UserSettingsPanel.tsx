import { useState } from 'react';

import { Button, Card, Input, Text } from '@/shared/components/ui';

interface UserSettingsPanelProps {
  initialEmail: string;
  onSave: (values: { email: string; password: string }) => void;
  isLoading?: boolean;
}

export function UserSettingsPanel({
  initialEmail,
  onSave,
  isLoading = false,
}: UserSettingsPanelProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Text variant="h4">Account Settings</Text>
        <Text variant="body-sm" className="text-muted">
          Update your email and password.
        </Text>
      </div>

      <div className="flex flex-col gap-4">
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
        <Button onClick={() => onSave({ email, password })} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}
