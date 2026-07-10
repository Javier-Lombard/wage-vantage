import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { toast } from '@/shared/lib/toast';

import { useAuth } from './useAuth';

/**
 * Estado y handlers del cluster login/signup + forgot-password, antes
 * triplicados en SalaryCalculator, ComparisonSheet y Navbar. El consumidor
 * decide cuándo abrir authDialog (directo, o tras un AuthPromptDialog de
 * upsell); este hook posee solo lo que es idéntico en los tres sitios: el
 * sub-flujo de reset y el submit de login/signup.
 */
export function useAuthFlow() {
  const { signInWithPassword, signUp, signInWithOAuth, resetPasswordForEmail } = useAuth();
  const resetPasswordDialog = useDisclosure();

  const openForgotPassword = (closeAuthDialog: () => void) => {
    closeAuthDialog();
    resetPasswordDialog.open();
  };

  const handleAuthSubmit = (
    credentials: { email: string; password: string },
    mode: 'login' | 'signup',
  ) => (mode === 'login' ? signInWithPassword(credentials) : signUp(credentials));

  const handleResetPassword = async (email: string) => {
    try {
      await resetPasswordForEmail(email);
      toast.success('Check your email for a reset link');
      resetPasswordDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset link.');
    }
  };

  return {
    resetPasswordDialog,
    openForgotPassword,
    handleAuthSubmit,
    handleResetPassword: (email: string) => void handleResetPassword(email),
    signInWithOAuth,
  };
}
