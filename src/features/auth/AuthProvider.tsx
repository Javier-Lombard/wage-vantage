import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/shared/lib/supabaseClient';

import { AuthContext, type AuthCredentials, type OAuthProvider } from './AuthContext';
import { invokeDeleteAccount } from './lib/deleteAccount';
import { mapUser } from './lib/mapUser';

import type { AppUser, UserMetadata } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session ? mapUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(async ({ email, password }: AuthCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(errorMessage(error, 'Could not log in. Please try again.'));
    // Defensa en profundidad: el proyecto ya tiene "Confirm email" activado en
    // Supabase (verificado en auth.users), pero se comprueba también aquí por
    // si esa config cambiara — cierra la sesión que Supabase acaba de abrir
    // en vez de dejar logueado a un usuario sin email confirmado.
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error('Please confirm your email before logging in.');
    }
  }, []);

  const signUp = useCallback(async ({ email, password }: AuthCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/confirm-email` },
    });
    if (error) throw new Error(errorMessage(error, 'Could not create account. Please try again.'));
    return { needsEmailConfirmation: data.session === null };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(errorMessage(error, 'Could not continue with ' + provider + '.'));
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(errorMessage(error, 'Could not sign out. Please try again.'));
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(errorMessage(error, 'Could not send reset link. Please try again.'));
  }, []);

  const updateProfile = useCallback(async (patch: Partial<UserMetadata>) => {
    const { data, error } = await supabase.auth.updateUser({ data: patch });
    if (error) throw new Error(errorMessage(error, 'Could not update profile. Please try again.'));
    setUser(mapUser(data.user));
  }, []);

  const updateCredentials = useCallback(async (patch: { email?: string; password?: string }) => {
    const { data, error } = await supabase.auth.updateUser(patch);
    if (error) {
      throw new Error(errorMessage(error, 'Could not update credentials. Please try again.'));
    }
    setUser(mapUser(data.user));
  }, []);

  const deleteAccount = useCallback(async () => {
    await invokeDeleteAccount();
    // El usuario ya no existe en el servidor llegados a este punto — un error
    // de signOut no debe leerse como que el borrado falló.
    await supabase.auth.signOut().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isPremium: user?.metadata.premium === true,
      isPasswordRecovery,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updateProfile,
      updateCredentials,
      deleteAccount,
    }),
    [
      user,
      loading,
      isPasswordRecovery,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updateProfile,
      updateCredentials,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
