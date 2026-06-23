import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '../Select';

const meta = {
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const countryOptions = (
  <>
    <option value="">Select country...</option>
    <option value="es">Spain</option>
    <option value="fr">France</option>
    <option value="de">Germany</option>
  </>
);

export const Default: Story = {
  args: {
    label: 'Country',
    children: countryOptions,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Country',
    helperText: 'Used to compare salaries against local averages.',
    children: countryOptions,
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    error: 'Please select a country.',
    children: countryOptions,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    disabled: true,
    children: countryOptions,
  },
};
