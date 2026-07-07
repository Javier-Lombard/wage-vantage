import { useState } from 'react';
import { AlertTriangle, Bookmark, Lock, Zap } from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionDialog } from '../ActionDialog';
import { Button } from '../Button';
import { FeatureItem } from '../FeatureItem';
import { Input } from '../Input';
import { Text } from '../Typography';

const meta = {
  component: ActionDialog,
} satisfies Meta<typeof ActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo(props: Omit<React.ComponentProps<typeof ActionDialog>, 'isOpen' | 'onClose'>) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Reopen dialog</Button>
      <ActionDialog {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export const DeleteConfirmation: Story = {
  args: {
    icon: AlertTriangle,
    tone: 'destructive',
    title: 'Delete saved comparison?',
    description:
      'This action cannot be undone. You will lose all data associated with this comparison.',
    secondaryAction: { label: 'Cancel', onClick: () => {} },
    primaryAction: { label: 'Delete', onClick: () => {} },
    isOpen: true,
    onClose: () => {},
  },
  render: (args) => <DialogDemo {...args} />,
};

export const SignInToContinue: Story = {
  args: {
    icon: Lock,
    title: 'Sign in to continue',
    description: 'Create a free account or log in to export to PDF.',
    secondaryAction: { label: 'Maybe later', onClick: () => {} },
    primaryAction: { label: 'Log in / Sign up', onClick: () => {} },
    isOpen: true,
    onClose: () => {},
  },
  render: (args) => <DialogDemo {...args} />,
};

export const UpgradeToPremium: Story = {
  args: {
    icon: Zap,
    tone: 'primary',
    title: 'Upgrade to export your comparison',
    description: 'Exporting is a Premium feature. Upgrade to unlock:',
    secondaryAction: { label: 'Maybe later', onClick: () => {} },
    primaryAction: { label: 'Upgrade to Premium', onClick: () => {} },
    isOpen: true,
    onClose: () => {},
    children: (
      <ul className="flex flex-col gap-2">
        <FeatureItem>Unlimited exports — PDF, PNG, CSV</FeatureItem>
        <FeatureItem>Compare up to 4 countries at once</FeatureItem>
        <FeatureItem>4 saved templates · 4 comparison sheets</FeatureItem>
      </ul>
    ),
  },
  render: (args) => <DialogDemo {...args} />,
};

export const SaveTemplate: Story = {
  args: {
    icon: Bookmark,
    title: 'Save as Template',
    description: 'Give this comparison a name so you can easily access it later.',
    secondaryAction: { label: 'Cancel', onClick: () => {} },
    primaryAction: { label: 'Save Template', onClick: () => {} },
    isOpen: true,
    onClose: () => {},
    children: <Input label="Template Name" placeholder="e.g. Senior SWE - London vs Berlin" />,
  },
  render: (args) => <DialogDemo {...args} />,
};

export const LogInToSave: Story = {
  args: {
    icon: Lock,
    title: 'Log in to save this comparison',
    description:
      'Create a free account to save templates, revisit past comparisons, and pick up where you left off.',
    secondaryAction: { label: 'Maybe later', onClick: () => {} },
    primaryAction: { label: 'Log In', onClick: () => {} },
    isOpen: true,
    onClose: () => {},
    footer: (
      <Text variant="body-sm" className="text-muted">
        New here? <span className="text-primary font-semibold">Create an account</span>
      </Text>
    ),
  },
  render: (args) => <DialogDemo {...args} />,
};
