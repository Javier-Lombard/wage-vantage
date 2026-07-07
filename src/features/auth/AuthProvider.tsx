import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';

type DemoTier = 'guest' | 'free' | 'premium';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Supabase session bootstrap pending implementation; el tier se simula
  // localmente para poder construir la UI premium-gated antes de tener auth real.
  const [tier, setTier] = useState<DemoTier>('guest');

  const setDemoTier = useCallback((next: DemoTier) => setTier(next), []);

  const value = useMemo(
    () => ({
      user: null,
      loading: false,
      isAuthenticated: tier !== 'guest',
      isPremium: tier === 'premium',
      setDemoTier,
    }),
    [tier, setDemoTier],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
