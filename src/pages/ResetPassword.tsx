import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';

import { Button, Card, Icon, Input, Text } from '@/shared/components/ui';
import { supabase } from '@/shared/lib/supabaseClient';
import { toast } from '@/shared/lib/toast';

/**
 * Destino del link de reset (redirectTo en resetPasswordForEmail). Supabase
 * detecta el token del hash de la URL (detectSessionInUrl) y emite
 * PASSWORD_RECOVERY antes de que este componente pueda leer la sesión, así
 * que escuchamos el evento en vez de asumir sesión ya presente en mount.
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsReady(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
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
            {isReady ? 'Enter your new password below.' : 'Waiting to confirm your reset link...'}
          </Text>
        </div>

        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          disabled={!isReady}
        />

        <Button onClick={() => void handleSubmit()} isLoading={isSaving} disabled={!isReady}>
          Update password
        </Button>
      </Card>
    </main>
  );
}
