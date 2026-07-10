import { AuthDialog } from './AuthDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';

import { useAuthFlow } from '../useAuthFlow';

export interface AuthFlowDialogsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Cluster de diálogos de auth (login/signup + forgot-password), montado una
 * vez por consumidor (SalaryCalculator, ComparisonSheet, Navbar). El
 * consumidor solo controla cuándo se abre `AuthDialog` — el sub-flujo de
 * reset (abrir/cerrar ResetPasswordDialog, enviar el email) es interno,
 * ningún caller lo dispara desde fuera.
 */
export function AuthFlowDialogs({ isOpen, onClose }: AuthFlowDialogsProps) {
  const { resetPasswordDialog, openForgotPassword, handleAuthSubmit, handleResetPassword, signInWithOAuth } =
    useAuthFlow();

  return (
    <>
      <AuthDialog
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleAuthSubmit}
        onForgotPassword={() => openForgotPassword(onClose)}
        onOAuth={(provider) => signInWithOAuth(provider)}
      />

      <ResetPasswordDialog
        isOpen={resetPasswordDialog.isOpen}
        onClose={resetPasswordDialog.close}
        onSubmit={handleResetPassword}
      />
    </>
  );
}
