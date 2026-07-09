import { Combobox } from '@/shared/components/ui';

import { useGetCountryOptionsQuery } from '../api/wageApi';
import { toComboboxOptions } from './toComboboxOptions';

import type { SalaryFormField } from './fieldConfig';

interface CountryAwareComboboxProps {
  field: SalaryFormField;
  value: string | null;
  fetchedOptions: string[] | undefined;
  isFetchingOptions: boolean;
  onChange: (value: string) => void;
  /** Países a ocultar de la lista (usado por CompareCountryModal para que no
   * se pueda elegir el país del form ni uno ya añadido a la comparación). */
  excludeOptions?: string[];
}

/**
 * Country is the one combobox-fetched-options field with no accumulated
 * filters yet — its options come from the dedicated getCountryOptions
 * endpoint instead of the cascade's shared fetch (see useWageInsights).
 * Isolated in its own component so the country-specific query hook isn't
 * called conditionally inside SalaryFormField's render body.
 */
export function CountryAwareCombobox({
  field,
  value,
  fetchedOptions,
  isFetchingOptions,
  onChange,
  excludeOptions,
}: CountryAwareComboboxProps) {
  const isCountryField = field.id === 'country';
  const countryQuery = useGetCountryOptionsQuery(undefined, { skip: !isCountryField });

  const rawOptions = isCountryField ? countryQuery.data : fetchedOptions;
  const options = excludeOptions?.length
    ? rawOptions?.filter((option) => !excludeOptions.includes(option))
    : rawOptions;
  const isLoading = isCountryField ? countryQuery.isLoading : isFetchingOptions;

  // Once answered, a field stops receiving live options (see
  // SalaryFormField's isLiveTarget check) — without this, its own value
  // would no longer appear in `options` and the Combobox would display blank
  // despite the value being set correctly in form state.
  const optionsWithOwnValue =
    value && !options?.includes(value) ? [...(options ?? []), value] : options;

  return (
    <Combobox
      label={field.label}
      options={toComboboxOptions(optionsWithOwnValue)}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      placeholder={isLoading ? 'Loading...' : undefined}
    />
  );
}
