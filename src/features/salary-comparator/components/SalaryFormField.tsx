import { Combobox, Input } from '@/shared/components/ui';

import { CascadeCombobox } from './CascadeCombobox';
import { CountryCombobox } from './CountryCombobox';
import { toComboboxOptions } from './toComboboxOptions';

import type { ChangeEvent } from 'react';
import type { WageFilterColumn } from '../api/wageApi.types';
import type { SalaryFormField as SalaryFormFieldConfig } from './fieldConfig';
import type { SalaryFormValues } from '../types';

interface SalaryFormFieldProps {
  field: SalaryFormFieldConfig;
  values: SalaryFormValues;
  onChange: (id: keyof SalaryFormValues, value: string | number) => void;
  /** Options for whichever combobox-fetched-options field is next in the cascade — shared across all fields, see useWageInsights. */
  fetchedOptions: string[] | undefined;
  isFetchingOptions: boolean;
  /** Which field fetchedOptions belongs to — only that field may render it as its own. */
  nextOptionsField: WageFilterColumn | undefined;
}

export function SalaryFormField({
  field,
  values,
  onChange,
  fetchedOptions,
  isFetchingOptions,
  nextOptionsField,
}: SalaryFormFieldProps) {
  const value = values[field.id];

  if (field.kind === 'number-input') {
    return (
      <Input
        type="number"
        label={field.label}
        value={value ?? ''}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(field.id, event.target.valueAsNumber)
        }
      />
    );
  }

  const selectedValue = typeof value === 'string' ? value : null;
  const handleSelect = (selected: string) => onChange(field.id, selected);

  if (field.kind === 'combobox-static-no-filter' || field.kind === 'combobox-static-but-filters') {
    return (
      <Combobox
        label={field.label}
        options={toComboboxOptions(field.options)}
        value={selectedValue}
        onChange={handleSelect}
      />
    );
  }

  // combobox-fetched-options. País no depende de la cascada: tiene su propio
  // endpoint, ver CountryCombobox.
  if (field.id === 'country') {
    return <CountryCombobox label={field.label} value={selectedValue} onChange={handleSelect} />;
  }

  // El resto de campos fetched del paso comparte un único par
  // fetchedOptions/isFetchingOptions (ver useWageInsights), válido solo para
  // el campo cuyo filterColumn es el destinatario actual de la cascada. Un
  // hermano ya contestado no debe mostrar como propias las opciones de otro.
  const isLiveTarget = field.filterColumn === nextOptionsField;

  return (
    <CascadeCombobox
      label={field.label}
      value={selectedValue}
      options={isLiveTarget ? fetchedOptions : undefined}
      isLoading={isLiveTarget && isFetchingOptions}
      onChange={handleSelect}
    />
  );
}
