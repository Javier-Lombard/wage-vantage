import { useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { FieldShell } from './FieldShell';
import { CONTROL_BASE, controlStateClasses } from './controlClasses';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  helperText?: string;
  error?: string;
  /** Optional explicit id; auto-generated otherwise so label/aria link up. */
  id?: string;
}

export function Input({ label, helperText, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      helperText={helperText}
      error={error}
      helperId={helperId}
      errorId={errorId}
      className={className}
    >
      <input
        id={fieldId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(CONTROL_BASE, controlStateClasses(hasError))}
        {...props}
      />
    </FieldShell>
  );
}
