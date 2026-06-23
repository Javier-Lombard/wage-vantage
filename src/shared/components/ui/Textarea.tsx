import { useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { FieldShell } from './FieldShell';
import { CONTROL_BASE, controlStateClasses } from './controlClasses';

import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string;
  helperText?: string;
  error?: string;
  id?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
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
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(CONTROL_BASE, controlStateClasses(hasError), 'resize-y')}
        {...props}
      />
    </FieldShell>
  );
}
