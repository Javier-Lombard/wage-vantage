import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';

import { useAuth } from '@/features/auth';
import { Button, Card, Icon, Input, Text } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

/**
 * Destino del link de reset (redirectTo en resetPasswordForEmail). Supabase
 * detecta el token del hash de la URL (detectSessionInUrl) y emite
 * PASSWORD_RECOVERY antes de que este componente pueda leer la sesión —
 * AuthProvider ya escucha ese evento globalmente y expone isPasswordRecovery,
 * así que aquí no hace falta una suscripción propia.
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const { isPasswordRecovery, updateCredentials } = useAuth();
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await updateCredentials({ password });
      toast.success('Password updated');
      void navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-24 md:px-8">
      <Card className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Icon icon={Lock} size={32} className="text-primary" />
          <Text variant="h3">Set a new password</Text>
          <Text variant="body-sm" className="text-muted">
            {isPasswordRecovery ? 'Enter your new password below.' : 'Waiting to confirm your reset link...'}
          </Text>
        </div>

        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          disabled={!isPasswordRecovery}
        />

        <Button onClick={() => void handleSubmit()} isLoading={isSaving} disabled={!isPasswordRecovery}>
          Update password
        </Button>
      </Card>
    </main>
  );
}
