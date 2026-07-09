import type { ComboboxOption } from '@/shared/components/ui';

/** Wraps a plain string list into the {value, label} shape Combobox expects. */
export function toComboboxOptions(values: string[] | undefined): ComboboxOption[] {
  return (values ?? []).map((value) => ({ value, label: value }));
}
