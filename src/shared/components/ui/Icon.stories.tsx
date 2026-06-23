import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Check } from 'lucide-react';
import { Icon } from './Icon';

const meta = {
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Bell,
  },
};

export const FeatureSize: Story = {
  args: {
    icon: Check,
    size: 24,
  },
};

export const WithAccessibleLabel: Story = {
  args: {
    icon: Bell,
    'aria-label': 'Notifications',
  },
};
