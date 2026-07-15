import { createContext } from 'react';

import type { AppUser, UserMetadata } from './types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export type OAuthProvider = 'google' | 'github';

export interface SignUpResult {
  /** true si Supabase exige confirmar el email antes de crear sesión (signUp no autentica de inmediato). */
  needsEmailConfirmation: boolean;
}

/**
 * Guest/free/premium de la matriz de acceso son dos ejes combinados, no un
 * enum de tres valores: premium implica autenticado, pero autenticado no
 * implica premium (usuario free). `isPremium` con `isAuthenticated=false` no
 * es un estado válido — deriva siempre de `user`, nunca se setea aparte.
 */
export type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  /** true entre el evento PASSWORD_RECOVERY de Supabase y la próxima navegación —
   * habilita el form de "nueva contraseña" en /reset-password. */
  isPasswordRecovery: boolean;
  signInWithPassword: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<SignUpResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  /** Merge shallow (top-level) sobre user_metadata vía supabase.auth.updateUser. */
  updateProfile: (patch: Partial<UserMetadata>) => Promise<void>;
  /** Actualiza email y/o password nativos de auth.users (no user_metadata — para
   * eso está updateProfile). Patch parcial: solo se envían los campos presentes. */
  updateCredentials: (patch: { email?: string; password?: string }) => Promise<void>;
  /** Borra la cuenta del usuario autenticado de forma permanente (Edge
   * Function delete-account) y cierra sesión localmente. */
  deleteAccount: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
