import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuth } from '@/features/auth';
import { ExportButton } from './ExportButton';

import type { AuthContextValue } from '@/features/auth';

// Mismo mock que en useFeatureAccess.test.ts: ExportButton depende de
// useFeatureAccess, que a su vez depende de useAuth — no de red/Supabase.
jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

function createAuthValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    loading: false,
    isAuthenticated: false,
    isPremium: false,
    isPasswordRecovery: false,
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateProfile: jest.fn(),
    updateCredentials: jest.fn(),
    deleteAccount: jest.fn(),
    ...overrides,
  };
}

describe('ExportButton', () => {
  // Usuario sin acceso premium: el click debe abrir el upsell, no el export real.
  it('shows the upgrade upsell instead of exporting when the user has no export access', async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: true, isPremium: false }));
    const user = userEvent.setup();
    const handleExport = jest.fn();

    render(<ExportButton onExport={handleExport} />);
    await user.click(screen.getByRole('button', { name: 'Export' }));

    const upgradeDialog = screen.getByRole('dialog', { name: 'Upgrade to export your comparison' });
    // showFeatureList=true en este UpgradeDialog: debe listar las features de premium/config.ts.
    expect(
      within(upgradeDialog).getByText('Unlimited exports — PDF, CSV, or PNG'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Export comparison' })).not.toBeInTheDocument();

    await user.click(within(upgradeDialog).getByRole('button', { name: 'Maybe later' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(handleExport).not.toHaveBeenCalled();
  });

  // Usuario premium: el click abre el selector de formato real y exporta.
  it('lets a premium user pick a format and export', async () => {
    mockedUseAuth.mockReturnValue(createAuthValue({ isAuthenticated: true, isPremium: true }));
    const user = userEvent.setup();
    const handleExport = jest.fn();

    render(<ExportButton onExport={handleExport} />);
    await user.click(screen.getByRole('button', { name: 'Export' }));

    const exportDialog = screen.getByRole('dialog', { name: 'Export comparison' });
    await user.click(within(exportDialog).getByRole('radio', { name: 'CSV' }));
    // Hay dos botones "Export" en pantalla (el trigger y el del diálogo) —
    // within(exportDialog) acota la búsqueda al del diálogo.
    await user.click(within(exportDialog).getByRole('button', { name: 'Export' }));

    expect(handleExport).toHaveBeenCalledWith('csv');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
