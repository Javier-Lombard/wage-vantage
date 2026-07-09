import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureItem } from '../FeatureItem';

const meta = {
  component: FeatureItem,
} satisfies Meta<typeof FeatureItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Included: Story = {
  args: {
    included: true,
    children: '3 salary comparisons per month',
  },
};

export const NotIncluded: Story = {
  args: {
    included: false,
    children: 'Export to PDF',
  },
};

export const List: Story = {
  args: {
    children: 'Compare up to 4 countries at once',
  },
  render: () => (
    <ul className="space-y-2">
      <FeatureItem>Compare up to 4 countries at once</FeatureItem>
      <FeatureItem>Access to 190+ countries</FeatureItem>
      <FeatureItem included={false}>Email support</FeatureItem>
    </ul>
  ),
};
