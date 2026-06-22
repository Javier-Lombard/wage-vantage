import { useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Supabase session bootstrap pending implementation.
  const [value] = useState<AuthContextValue>({ user: null, loading: false });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
