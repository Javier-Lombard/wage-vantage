import { Combobox } from '@/shared/components/ui';

import { toComboboxOptions } from './toComboboxOptions';

interface CascadeComboboxProps {
  label: string;
  value: string | null;
  /** Opciones de la respuesta compartida de useWageInsights, o undefined si
   * este campo no es el destinatario actual de la cascada (ver isLiveTarget
   * en SalaryFormField). */
  options: string[] | undefined;
  isLoading: boolean;
  onChange: (value: string) => void;
}

/**
 * Combobox de un campo de la cascada (Occupation, Occupation Level, Economic
 * Activity, Education Level): sus opciones dependen de los filtros ya
 * elegidos y le llegan desde fuera, ya resuelto si le corresponden o no.
 */
export function CascadeCombobox({
  label,
  value,
  options,
  isLoading,
  onChange,
}: CascadeComboboxProps) {
  // Un campo ya contestado deja de ser destinatario y recibe undefined: sin
  // añadir su propio valor, el Combobox lo mostraría en blanco aunque el
  // estado del form lo tenga.
  const optionsWithOwnValue =
    value && !options?.includes(value) ? [...(options ?? []), value] : options;

  return (
    <Combobox
      label={label}
      options={toComboboxOptions(optionsWithOwnValue)}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      placeholder={isLoading ? 'Loading...' : undefined}
    />
  );
}
