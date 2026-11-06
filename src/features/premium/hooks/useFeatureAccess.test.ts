import { renderHook } from '@testing-library/react';

import { useAuth } from '@/features/auth';
import { useFeatureAccess } from './useFeatureAccess';

import type { AuthContextValue } from '@/features/auth';

// Sustituye el barrel de auth: evita montar AuthProvider/Supabase y deja que
// cada test decida el estado de auth que useFeatureAccess debe traducir.
jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

/**
 * Devuelve el AuthContextValue completo con overrides — el hook solo lee
 * isAuthenticated/isPremium, pero tipamos el valor entero (sin `as`) porque
 * tsc tipa los tests igual que el código de producción.
 */
function createAuthValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    loading: false,
    isAuthenticated: false,
    isPremium: false,
    isPasswordRecovery: false,
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateProfile: jest.fn(),
    updateCredentials: jest.fn(),
    deleteAccount: jest.fn(),
    ...overrides,
  };
}

describe('useFeatureAccess', () => {
  it.each([
    {
      label: 'guest',
      auth: { isAuthenticated: false, isPremium: false },
      tier: 'guest',
      maxCountries: 2,
      canExport: false,
    },
    {
      label: 'free',
      auth: { isAuthenticated: true, isPremium: false },
      tier: 'free',
      maxCountries: 2,
      canExport: false,
    },
    {
      label: 'premium',
      auth: { isAuthenticated: true, isPremium: true },
      tier: 'premium',
      maxCountries: 3,
      canExport: true,
    },
  ])(
    'derives tier "$tier" and its limits for a $label user',
    ({ auth, tier, maxCountries, canExport }) => {
      mockedUseAuth.mockReturnValue(createAuthValue(auth));

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.tier).toBe(tier);
      expect(result.current.limits.maxCountries).toBe(maxCountries);
      expect(result.current.can('canExport')).toBe(canExport);
    },
  );

  // El hook no guarda estado propio: si el auth context cambia (login real,
  // demo toggle), debe recalcular el tier solo, sin acción explícita.
  it('recomputes the tier when the auth context changes', () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: false, isPremium: false }));

    const { result, rerender } = renderHook(() => useFeatureAccess());
    expect(result.current.tier).toBe('guest');

    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: true, isPremium: false }));
    rerender();

    expect(result.current.tier).toBe('free');
  });
});
