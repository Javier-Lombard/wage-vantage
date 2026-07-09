import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from '../SegmentedControl';

const meta = {
  component: SegmentedControl,
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function BillingCycleDemo() {
  const [value, setValue] = useState<'monthly' | 'annual'>('monthly');
  return (
    <SegmentedControl
      options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'annual', label: 'Annual' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

export const BillingCycle: Story = {
  args: {
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'annual', label: 'Annual' },
    ],
    value: 'monthly',
    onChange: () => {},
  },
  render: () => <BillingCycleDemo />,
};
