import { Combobox, Input } from '@/shared/components/ui';

import { CountryAwareCombobox } from './CountryAwareCombobox';
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

  if (field.kind === 'combobox-static-no-filter' || field.kind === 'combobox-static-but-filters') {
    return (
      <Combobox
        label={field.label}
        options={toComboboxOptions(field.options)}
        value={typeof value === 'string' ? value : null}
        onChange={(selected) => onChange(field.id, selected)}
      />
    );
  }

  // combobox-fetched-options — every field of this kind in the same step
  // shares one fetchedOptions/isFetchingOptions pair (see useWageInsights),
  // but it's only meaningful for the field whose filterColumn the cascade is
  // currently targeting. An already-answered sibling must not render
  // another field's options as its own (it would also blank its display,
  // since its own value wouldn't be among them).
  const isLiveTarget = field.id === 'country' || field.filterColumn === nextOptionsField;

  return (
    <CountryAwareCombobox
      field={field}
      value={typeof value === 'string' ? value : null}
      fetchedOptions={isLiveTarget ? fetchedOptions : undefined}
      isFetchingOptions={isLiveTarget && isFetchingOptions}
      onChange={(selected) => onChange(field.id, selected)}
    />
  );
}
