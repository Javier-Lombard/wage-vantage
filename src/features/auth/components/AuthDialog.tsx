import { useState } from 'react';
import { Lock } from 'lucide-react';

import { ActionDialog, Input, Text } from '@/shared/components/ui';

type AuthMode = 'login' | 'signup';

const MODE_COPY: Record<AuthMode, { title: string; primaryLabel: string }> = {
  login: { title: 'Log in', primaryLabel: 'Log In' },
  signup: { title: 'Create an account', primaryLabel: 'Sign Up' },
};

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modo inicial al abrir; el usuario puede alternarlo con el link inferior. */
  initialMode?: AuthMode;
  onSubmit: (credentials: { email: string; password: string }, mode: AuthMode) => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

export function AuthDialog({
  isOpen,
  onClose,
  initialMode = 'login',
  onSubmit,
  onForgotPassword,
  isLoading = false,
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const otherMode: AuthMode = mode === 'login' ? 'signup' : 'login';

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Lock}
      title={MODE_COPY[mode].title}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{
        label: MODE_COPY[mode].primaryLabel,
        onClick: () => onSubmit({ email, password }, mode),
        isLoading,
      }}
      footer={
        <div className="flex flex-col gap-2">
          {mode === 'login' && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-primary cursor-pointer text-sm font-semibold hover:underline"
            >
              Forgot password?
            </button>
          )}
          <Text variant="body-sm" className="text-muted">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(otherMode)}
              className="text-primary cursor-pointer font-semibold hover:underline"
            >
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </Text>
        </div>
      }
    >
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
      />
    </ActionDialog>
  );
}
