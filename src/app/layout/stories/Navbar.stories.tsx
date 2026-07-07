import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { Navbar } from '../Navbar';

/**
 * Navbar reads routing context (NavLink) and theme context (useTheme), neither
 * of which exists globally in preview.tsx — no other story in the design
 * system needs them. Scoped here via a local decorator instead of widening
 * every story in the project to carry a router/theme it doesn't use.
 */
const meta = {
  component: Navbar,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default render. Resize the preview canvas below the `md` breakpoint (768px)
 * to see the collapsed mobile header — the switch is pure CSS (`md:hidden` /
 * `hidden md:flex`), not a prop, so there's no separate "Mobile" args variant.
 */
export const Default: Story = {};
