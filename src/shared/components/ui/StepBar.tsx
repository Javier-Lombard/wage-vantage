import { cn } from '@/shared/lib/cn';

interface StepBarProps {
  steps: string[];
  /** Zero-based index of the current step. */
  currentStep: number;
  className?: string;
}

export function StepBar({ steps, currentStep, className }: StepBarProps) {
  return (
    <ol className={cn('flex w-full items-center', className)} aria-label="Form progress">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={label} className={cn('flex items-center', !isLast && 'flex-1')}>
            <span
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={label}
              className={cn(
                'h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300',
                isCompleted || isCurrent ? 'bg-primary' : 'bg-border',
              )}
            />

            {!isLast && (
              <span
                className={cn(
                  'mx-1.5 h-0.5 flex-1 rounded-full transition-colors duration-300',
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
