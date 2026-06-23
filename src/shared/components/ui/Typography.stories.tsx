import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Typography';

const meta = {
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    variant: 'h1',
    children: 'Hero heading',
  },
};

export const H2: Story = {
  args: {
    variant: 'h2',
    children: 'Page heading',
  },
};

export const H3: Story = {
  args: {
    variant: 'h3',
    children: 'Section heading',
  },
};

export const H4: Story = {
  args: {
    variant: 'h4',
    children: 'Card title',
  },
};

export const H5: Story = {
  args: {
    variant: 'h5',
    children: 'Emphasis heading',
  },
};

export const H6: Story = {
  args: {
    variant: 'h6',
    children: 'Smallest heading',
  },
};

export const BodyLg: Story = {
  args: {
    variant: 'body-lg',
    children: 'Lead paragraph text used for intros and emphasis.',
  },
};

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'Default body text for paragraphs and descriptions.',
  },
};

export const BodySm: Story = {
  args: {
    variant: 'body-sm',
    children: 'Smaller secondary body text, used for helper copy.',
  },
};

export const Label: Story = {
  args: {
    variant: 'label',
    children: 'Form label',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'Caption / fine print',
  },
};
