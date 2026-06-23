import { cn } from '@/shared/lib/cn';
import { Text } from './Typography';

import type { ReactNode } from 'react';

/** Label styling mirrors Typography's `label` variant (sm / semibold). */
const LABEL_CLASSES = 'text-sm font-semibold text-foreground';

/**
 * Shared label + helper-text + error-message scaffolding for the form controls
 * (Input, Textarea, Select). Extracted on the third occurrence per the
 * DRY-with-restraint rule — the three controls only differ in the control
 * element itself, so the surrounding field chrome lives here once.
 *
 * The control is passed as `children` so this stays presentational and owns no
 * input state. Wiring (`id`, `aria-describedby`, `aria-invalid`) is computed by
 * each control and passed down via `fieldId` / the ids below.
 */
interface FieldShellProps {
  fieldId: string;
  label?: string;
  helperText?: string;
  error?: string;
  helperId: string;
  errorId: string;
  className?: string;
  children: ReactNode;
}

export function FieldShell({
  fieldId,
  label,
  helperText,
  error,
  helperId,
  errorId,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className={LABEL_CLASSES}>
          {label}
        </label>
      )}

      {children}

      {/* Error takes precedence over helper text — never show both. */}
      {error ? (
        <Text id={errorId} variant="body-sm" className="text-error">
          {error}
        </Text>
      ) : (
        helperText && (
          <Text id={helperId} variant="body-sm" className="text-muted">
            {helperText}
          </Text>
        )
      )}
    </div>
  );
}
