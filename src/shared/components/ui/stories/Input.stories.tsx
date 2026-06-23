import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input';

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Job title',
    placeholder: 'e.g. Software Engineer',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Annual salary',
    placeholder: '50000',
    helperText: 'Enter the gross amount in your local currency.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Annual salary',
    placeholder: '50000',
    error: 'Salary must be a positive number.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    value: 'Spain',
    disabled: true,
  },
};
