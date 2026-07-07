import { cn } from '@/shared/lib/cn';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Toggle tipo píldora entre 2+ opciones cerradas (p. ej. Monthly/Annual en
 * pricing). Genérico en `T` para que el caller conserve su propio union type
 * en vez de trabajar con strings sueltos.
 */
interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'bg-surface border-border inline-flex gap-1 rounded-full border p-1',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              isActive ? 'bg-primary text-on-primary' : 'text-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
