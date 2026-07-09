import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Bookmark, Lock, Zap } from 'lucide-react';
import { IconBadge } from '../IconBadge';

const meta = {
  component: IconBadge,
} satisfies Meta<typeof IconBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Lock,
    tone: 'default',
  },
};

export const Primary: Story = {
  args: {
    icon: Zap,
    tone: 'primary',
  },
};

export const Destructive: Story = {
  args: {
    icon: AlertTriangle,
    tone: 'destructive',
  },
};

export const Warning: Story = {
  args: {
    icon: Bookmark,
    tone: 'warning',
  },
};
