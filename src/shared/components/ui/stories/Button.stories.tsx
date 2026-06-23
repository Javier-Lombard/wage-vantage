import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Get Started',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Skip',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Get Started',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Saving...',
    isLoading: true,
  },
};
