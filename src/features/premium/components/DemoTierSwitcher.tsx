import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui';

/**
 * Solo para desarrollo: permite alternar guest/free/premium mientras no hay
 * login real, para poder construir y probar toda la UI premium-gated. No se
 * monta en ninguna page todavía — cada feature lo importa en su propio
 * entorno de prueba (Storybook, o temporalmente en una page) según lo necesite.
 */
export function DemoTierSwitcher() {
  const { setDemoTier } = useAuth();

  return (
    <div className="border-border-subtle bg-surface fixed bottom-4 right-4 z-50 flex gap-2 rounded-full border p-2 shadow-lg">
      <Button variant="ghost" onClick={() => setDemoTier('guest')}>
        Demo Guest
      </Button>
      <Button variant="ghost" onClick={() => setDemoTier('free')}>
        Demo Free
      </Button>
      <Button variant="ghost" onClick={() => setDemoTier('premium')}>
        Demo Premium
      </Button>
    </div>
  );
}
