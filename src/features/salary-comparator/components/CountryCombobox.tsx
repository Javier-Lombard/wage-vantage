import { Combobox } from '@/shared/components/ui';

import { useGetCountryOptionsQuery } from '../api/wageApi';
import { toComboboxOptions } from './toComboboxOptions';

import type { ComponentProps } from 'react';

interface CountryComboboxProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  /** Países a ocultar de la lista (usado por CompareCountryModal para que no
   * se pueda elegir el país del form ni uno ya añadido a la comparación). */
  excludeOptions?: string[];
  /** Se reenvía tal cual al Combobox — ver su doc. */
  inputMode?: ComponentProps<typeof Combobox>['inputMode'];
}

/**
 * Selector de país. Es el único campo de la cascada sin filtros previos, así
 * que sus opciones salen del endpoint dedicado getCountryOptions y no de la
 * respuesta compartida de useWageInsights (esa la consume CascadeCombobox).
 * Lo montan el paso 1 del form, vía SalaryFormField, y CompareCountryModal.
 */
export function CountryCombobox({
  label,
  value,
  onChange,
  excludeOptions,
  inputMode,
}: CountryComboboxProps) {
  const { data, isLoading } = useGetCountryOptionsQuery();

  const options = excludeOptions?.length
    ? data?.filter((country) => !excludeOptions.includes(country))
    : data;

  // Tras un F5 el valor llega de sessionStorage antes que la lista de países:
  // sin añadirlo, el input se vería vacío mientras la query carga.
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
      inputMode={inputMode}
    />
  );
}
