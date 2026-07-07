import { createContext } from 'react';

/**
 * Guest/free/premium de la matriz de acceso son dos ejes combinados, no un
 * enum de tres valores: premium implica autenticado, pero autenticado no
 * implica premium (usuario free). `isPremium` con `isAuthenticated=false` no
 * es un estado válido — `setDemoTier` es el único punto que los cambia juntos.
 */
export type AuthContextValue = {
  user: null;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  /** Solo para desarrollo: alterna entre los tres estados de la matriz de acceso mientras no existe login real. */
  setDemoTier: (tier: 'guest' | 'free' | 'premium') => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
