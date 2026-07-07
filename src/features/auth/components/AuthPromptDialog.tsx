import { Lock } from 'lucide-react';

import { ActionDialog, Text } from '@/shared/components/ui';

/**
 * Cubre los dos upsells de autenticación del mock ("Sign in to continue" y
 * "Log in to save this comparison") con un único componente — solo cambia
 * copy y si se muestra el footer "Create an account", nunca el layout, que
 * ya resuelve ActionDialog.
 */
type AuthPromptVariant = 'sign-in-to-continue' | 'log-in-to-save';

const VARIANT_COPY: Record<
  AuthPromptVariant,
  { title: string; description: string; primaryLabel: string; showCreateAccountFooter: boolean }
> = {
  'sign-in-to-continue': {
    title: 'Sign in to continue',
    description: 'Create a free account or log in to export to PDF.',
    primaryLabel: 'Log in / Sign up',
    showCreateAccountFooter: false,
  },
  'log-in-to-save': {
    title: 'Log in to save this comparison',
    description:
      'Create a free account to save templates, revisit past comparisons, and pick up where you left off.',
    primaryLabel: 'Log In',
    showCreateAccountFooter: true,
  },
};

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: AuthPromptVariant;
  onLogIn: () => void;
}

export function AuthPromptDialog({ isOpen, onClose, variant, onLogIn }: AuthPromptDialogProps) {
  const copy = VARIANT_COPY[variant];

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Lock}
      title={copy.title}
      description={copy.description}
      secondaryAction={{ label: 'Maybe later', onClick: onClose }}
      primaryAction={{ label: copy.primaryLabel, onClick: onLogIn }}
      footer={
        copy.showCreateAccountFooter && (
          <Text variant="body-sm" className="text-muted">
            New here? <span className="text-primary font-semibold">Create an account</span>
          </Text>
        )
      }
    />
  );
}
