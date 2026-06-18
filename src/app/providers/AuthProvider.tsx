import { createContext, useContext, useState, type ReactNode } from 'react';

type AuthContextValue = {
  user: null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Supabase session bootstrap pending implementation.
  const [value] = useState<AuthContextValue>({ user: null, loading: false });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
