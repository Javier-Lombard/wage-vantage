import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card';
import { Text } from '../Typography';

const meta = {
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Text variant="h4">Card Title</Text>
        <Text variant="body-sm" className="text-muted mt-2">
          Description text here.
        </Text>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    as: 'button',
    interactive: true,
    className: 'text-left w-full',
    children: (
      <>
        <Text variant="h4">Saved Comparisons</Text>
        <Text variant="body-sm" className="text-muted mt-2">
          3 comparisons saved
        </Text>
      </>
    ),
  },
};
