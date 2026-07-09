import { Lock } from 'lucide-react';

import { ActionDialog, Text } from '@/shared/components/ui';

/**
 * Cubre los upsells de autenticación del mock con un único componente — solo
 * cambia copy y si se muestra el footer "Create an account", nunca el
 * layout, que ya resuelve ActionDialog.
 *
 * Los tres variants de "templates/comparison" están separados (en vez de un
 * único 'log-in-to-save' genérico) porque son acciones distintas que un
 * usuario puede confundir: 'log-in-to-load-template' es CARGAR una template
 * ya guardada para fast-fill (botón "Fast fill with a template"),
 * 'log-in-to-save-template' es GUARDAR los valores actuales del form como
 * template nueva (botón "Save as a template") — ambas en SalaryForm — y
 * 'log-in-to-save-comparison' es guardar la COMPARISON SHEET ya calculada
 * para revisitarla luego (ComparisonSheet). Mismo gate de auth, copy
 * distinto para no hablar de "comparación" cuando en realidad se trata de
 * una template, y viceversa.
 */
type AuthPromptVariant =
  | 'sign-in-to-continue'
  | 'log-in-to-load-template'
  | 'log-in-to-save-template'
  | 'log-in-to-save-comparison';

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
  'log-in-to-load-template': {
    title: 'Log in to fast-fill from a saved template',
    description:
      'Create a free account to store your templates and fast-fill this form in a single click.',
    primaryLabel: 'Log In',
    showCreateAccountFooter: true,
  },
  'log-in-to-save-template': {
    title: 'Log in to save this as a template',
    description:
      'Create a free account to save your answers as a reusable template you can fast-fill next time.',
    primaryLabel: 'Log In',
    showCreateAccountFooter: true,
  },
  'log-in-to-save-comparison': {
    title: 'Log in to save this comparison',
    description:
      'Create a free account to save this comparison sheet and revisit it anytime from your dashboard.',
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
