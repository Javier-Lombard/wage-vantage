import { useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';

import { useAuth } from '@/features/auth';
import { Button, Card, Icon, Text } from '@/shared/components/ui';

/**
 * Destino de emailRedirectTo en signUp. A diferencia de PASSWORD_RECOVERY,
 * Supabase no emite un evento distinto para "email confirmado" — al pulsar
 * el link intercambia el token del hash de la URL y dispara un SIGNED_IN
 * normal, indistinguible de un login. Por eso esta página no se suscribe a
 * onAuthStateChange por su cuenta: se apoya en isAuthenticated/loading, ya
 * globales vía AuthProvider, igual que ResetPassword se apoya en
 * isPasswordRecovery.
 */
export function ConfirmEmail() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const statusCopy = loading
    ? 'Confirming your email...'
    : isAuthenticated
      ? "Email confirmed! You're all set."
      : 'This link may have expired — try logging in again.';

  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-24 md:px-8">
      <Card className="flex w-full flex-col items-center gap-6 text-center">
        <Icon icon={CheckCircle2} size={32} className="text-accent-fg" />
        <div className="flex flex-col gap-2">
          <Text variant="h3">Welcome to Wage Comparator</Text>
          <Text variant="body-sm" className="text-muted">
            {statusCopy}
          </Text>
        </div>

        <div className="flex w-full gap-3">
          <Button variant="outline" onClick={() => void navigate('/')} className="flex-1">
            Go to Home
          </Button>
          <Button
            onClick={() => void navigate('/dashboard')}
            disabled={!isAuthenticated}
            className="flex-1"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </main>
  );
}
