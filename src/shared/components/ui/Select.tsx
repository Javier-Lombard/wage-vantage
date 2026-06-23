import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { FieldShell } from './FieldShell';
import { Icon } from './Icon';
import { CONTROL_BASE, controlStateClasses } from './controlClasses';

import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: string;
  helperText?: string;
  error?: string;
  id?: string;
}

export function Select({
  label,
  helperText,
  error,
  id,
  className,
  children,
  ...props
}: SelectProps) {
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
      {/* Relative wrapper hosts the custom chevron; the native one is removed
          via appearance-none so the icon stays mode-aware (currentColor). */}
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          className={cn(CONTROL_BASE, controlStateClasses(hasError), 'appearance-none pr-10')}
          {...props}
        >
          {children}
        </select>
        <Icon
          icon={ChevronDown}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  );
}
