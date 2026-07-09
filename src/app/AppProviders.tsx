import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from './providers/ThemeProvider';

import type { ReactNode } from 'react';

/**
 * Único punto donde `main.tsx` toca providers concretos. AuthProvider vive en
 * features/auth (boundaries prohíbe features → app, así que main no puede
 * importarlo directamente desde ahí); este wrapper sí puede, porque
 * `app → features` está permitido — main solo conoce este archivo de `app/`.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
