import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/shared/lib/supabaseClient';

import { AuthContext, type AuthCredentials, type OAuthProvider } from './AuthContext';
import { mapUser } from './lib/mapUser';

import type { AppUser, UserMetadata } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session ? mapUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(async ({ email, password }: AuthCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(errorMessage(error, 'Could not log in. Please try again.'));
  }, []);

  const signUp = useCallback(async ({ email, password }: AuthCredentials) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
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

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isPremium: user?.metadata.premium === true,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updateProfile,
    }),
    [
      user,
      loading,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPasswordForEmail,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
