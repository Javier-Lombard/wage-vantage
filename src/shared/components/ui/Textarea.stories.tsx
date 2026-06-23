import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Add any additional context...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Job description',
    placeholder: 'Describe your main responsibilities...',
    helperText: 'This helps us match you with similar roles.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Job description',
    placeholder: 'Describe your main responsibilities...',
    error: 'This field is required.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Notes',
    value: 'No additional notes provided.',
    disabled: true,
  },
};
