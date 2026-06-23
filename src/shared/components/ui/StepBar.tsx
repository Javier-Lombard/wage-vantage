import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

/**
 * Horizontal step indicator for the multi-step salary form. Purely
 * presentational: it receives the labels and the active index and renders
 * completed / current / upcoming states — it owns no step logic.
 *
 * State colors:
 *  - completed → filled `primary` with a check
 *  - current   → outlined `primary`
 *  - upcoming  → `muted` on a subtle surface
 */
interface StepBarProps {
  steps: string[];
  /** Zero-based index of the current step. */
  currentStep: number;
  className?: string;
}

export function StepBar({ steps, currentStep, className }: StepBarProps) {
  return (
    <ol className={cn('flex w-full items-center', className)}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isCompleted && 'bg-primary text-on-primary',
                  isCurrent && 'border-2 border-primary text-primary',
                  !isCompleted && !isCurrent && 'bg-surface-hover text-muted',
                )}
              >
                {isCompleted ? <Icon icon={Check} size={16} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isCurrent ? 'text-foreground' : 'text-muted',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line between steps — filled once the step is done. */}
            {!isLast && (
              <span
                className={cn(
                  'mx-3 h-0.5 flex-1 rounded-full transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
