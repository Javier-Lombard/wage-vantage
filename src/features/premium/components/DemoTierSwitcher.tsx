import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

/**
 * Solo para desarrollo (montado en RootLayout bajo import.meta.env.DEV):
 * alterna la matriz guest/free/premium sobre la sesión Supabase real. Guest
 * cierra sesión; free/premium escriben el flag `premium` en user_metadata,
 * así que requieren estar logueado — no pueden "crear" una sesión.
 */
export function DemoTierSwitcher() {
  const { isAuthenticated, signOut, updateProfile } = useAuth();

  const handleSetTier = async (tier: 'guest' | 'free' | 'premium') => {
    try {
      if (tier === 'guest') {
        await signOut();
        return;
      }
      if (!isAuthenticated) {
        toast.error('Log in first to demo free/premium');
        return;
      }
      await updateProfile({ premium: tier === 'premium' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not switch demo tier.');
    }
  };

  return (
    <div className="border-border-subtle bg-surface fixed bottom-4 right-4 z-50 flex gap-2 rounded-full border p-2 shadow-lg">
      <Button variant="ghost" onClick={() => void handleSetTier('guest')}>
        Demo Guest
      </Button>
      <Button variant="ghost" onClick={() => void handleSetTier('free')}>
        Demo Free
      </Button>
      <Button variant="ghost" onClick={() => void handleSetTier('premium')}>
        Demo Premium
      </Button>
    </div>
  );
}
