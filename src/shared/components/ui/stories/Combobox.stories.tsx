import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComboboxOption } from '../Combobox';
import { Combobox } from '../Combobox';

const meta = {
  component: Combobox,
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const countryOptions: ComboboxOption[] = [
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'it', label: 'Italy' },
  { value: 'pt', label: 'Portugal' },
];

function ControlledCombobox(props: { label?: string; helperText?: string; error?: string }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox
      {...props}
      options={countryOptions}
      value={value}
      onChange={setValue}
      placeholder="Search country..."
    />
  );
}

const baseArgs = {
  options: countryOptions,
  value: null,
  onChange: () => {},
};

export const Default: Story = {
  args: { ...baseArgs, label: 'Country' },
  render: () => <ControlledCombobox label="Country" />,
};

export const WithHelperText: Story = {
  args: {
    ...baseArgs,
    label: 'Country',
    helperText: 'Used to compare salaries against local averages.',
  },
  render: () => (
    <ControlledCombobox
      label="Country"
      helperText="Used to compare salaries against local averages."
    />
  ),
};

export const WithError: Story = {
  args: { ...baseArgs, label: 'Country', error: 'Please select a country.' },
  render: () => <ControlledCombobox label="Country" error="Please select a country." />,
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    value: null,
    onChange: () => {},
    disabled: true,
  },
};
