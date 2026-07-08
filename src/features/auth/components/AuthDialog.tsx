import { useState } from 'react';
import { Lock } from 'lucide-react';

import { ActionDialog, Input, Text } from '@/shared/components/ui';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';

type AuthMode = 'login' | 'signup';

/**
 * Marca de Google multicolor: lucide no la incluye y su SVG no usa currentColor,
 * así que va inline en vez de por el wrapper Icon (que es solo para lucide).
 */
function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

/**
 * Marca de GitHub: la versión actual de lucide ya no la incluye, así que va
 * inline. Monocromo con currentColor para heredar el color del botón.
 */
function GitHubIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1C5.92 1 1 5.92 1 12c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.86c-3.06.67-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.47-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1.01.74 2.04v3.03c0 .29.2.64.76.53A11.01 11.01 0 0 0 23 12c0-6.08-4.92-11-11-11Z" />
    </svg>
  );
}

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
      {/* OAuth pendiente de implementar: por ahora solo entradas visuales (no-op). */}
      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => {}} className={outlineButtonClasses()}>
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" onClick={() => {}} className={outlineButtonClasses()}>
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-border-subtle h-px flex-1" />
        <Text variant="body-sm" className="text-muted">
          or
        </Text>
        <span className="bg-border-subtle h-px flex-1" />
      </div>

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
