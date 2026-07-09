import { Lock } from 'lucide-react';

import { AuthDialog, AuthPromptDialog, ResetPasswordDialog, useAuth } from '@/features/auth';
import { ExportButton } from '@/features/export';
import { PremiumGate } from '@/features/premium';
import { Button, Card, ErrorBoundary, Icon, Text } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/lib/toast';

import { OccupationSalaryBandsChart } from './OccupationSalaryBandsChart';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { SalaryGrowthChart } from './SalaryGrowthChart';
import { SaveComparisonDialog } from './SaveComparisonDialog';
import { SectorDistributionChart } from './SectorDistributionChart';

interface ComparisonSheetProps {
  countries: [string, string];
  /** País del usuario (de SalaryFormValues.country vía location.state) — resalta su badge. */
  primaryCountry?: string;
  /** De SalaryFormValues.monthlyWage — alimenta la línea "You" de SectorDistributionChart. */
  userWage?: number;
  /** Gatea el detalle numérico exacto — free/guest ven un placeholder en vez del chart real. */
  hasAccurateData: boolean;
}

interface PremiumChartFallbackProps {
  title: string;
}

/** Mismo footprint (título + cuerpo h-[260px]) que un chart real, para no romper el ritmo del grid. */
function PremiumChartFallback({ title }: PremiumChartFallbackProps) {
  return (
    <div className="flex flex-col gap-4">
      <Text variant="h4">{title}</Text>
      <div className="bg-surface-hover border-border-subtle flex h-65 flex-col items-center justify-center gap-2 rounded-lg border text-center">
        <Icon icon={Lock} size={24} className="text-muted" />
        <Text variant="body-sm" className="text-muted px-6">
          Upgrade to Premium for detailed data
        </Text>
      </div>
    </div>
  );
}

export function ComparisonSheet({
  countries,
  primaryCountry,
  userWage,
  hasAccurateData,
}: ComparisonSheetProps) {
  const {
    isAuthenticated,
    user,
    signInWithPassword,
    signUp,
    signInWithOAuth,
    resetPasswordForEmail,
    updateProfile,
  } = useAuth();
  const saveDialog = useDisclosure();
  const authPrompt = useDisclosure();
  const authDialog = useDisclosure();
  const resetPasswordDialog = useDisclosure();

  // Auth gate: guest ve el upsell de login (mismo patrón que el save de
  // templates en SalaryCalculator); logueado va directo al form de guardado.
  const handleSaveClick = () => {
    if (isAuthenticated) {
      saveDialog.open();
    } else {
      authPrompt.open();
    }
  };

  const handleSaveComparison = async (name: string) => {
    if (!user) return;
    try {
      const newComparison = {
        id: crypto.randomUUID(),
        name,
        savedAt: new Date().toISOString(),
        selectedCountries: countries,
        primaryCountry,
        userWage,
        values: { country: primaryCountry, monthlyWage: userWage },
      };
      await updateProfile({
        comparisons: [...(user.metadata.comparisons ?? []), newComparison],
      });
      toast.success('Comparison saved');
      saveDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save comparison.');
    }
  };

  const openAuthDialog = () => {
    authPrompt.close();
    authDialog.open();
  };

  const openForgotPassword = () => {
    authDialog.close();
    resetPasswordDialog.open();
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPasswordForEmail(email);
      toast.success('Check your email for a reset link');
      resetPasswordDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset link.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Text variant="h2">Comparison Sheet</Text>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {countries.map((country) => {
            const isPrimary = country === primaryCountry;
            return (
              <span
                key={country}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm font-semibold',
                  isPrimary
                    ? 'border-primary bg-primary-muted text-primary'
                    : 'border-border-subtle bg-surface-hover text-foreground',
                )}
              >
                {country}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSaveClick}>
            Save
          </Button>
          <ExportButton onExport={() => {}} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <PremiumGate
            hasAccess={hasAccurateData}
            fallback={<PremiumChartFallback title="Salary Distribution" />}
          >
            <ErrorBoundary>
              <SalaryDistributionChart countries={countries} />
            </ErrorBoundary>
          </PremiumGate>
        </Card>

        <Card>
          <ErrorBoundary>
            <SalaryGrowthChart countries={countries} />
          </ErrorBoundary>
        </Card>

        <Card>
          <ErrorBoundary>
            <SectorDistributionChart countries={countries} userWage={userWage} />
          </ErrorBoundary>
        </Card>

        <Card>
          <PremiumGate
            hasAccess={hasAccurateData}
            fallback={<PremiumChartFallback title="Occupation Salary Bands" />}
          >
            <ErrorBoundary>
              <OccupationSalaryBandsChart countries={countries} />
            </ErrorBoundary>
          </PremiumGate>
        </Card>
      </div>

      <SaveComparisonDialog
        isOpen={saveDialog.isOpen}
        onClose={saveDialog.close}
        onSave={(name) => void handleSaveComparison(name)}
      />

      <AuthPromptDialog
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.close}
        variant="log-in-to-save-comparison"
        onLogIn={openAuthDialog}
      />

      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={authDialog.close}
        onSubmit={({ email, password }, mode) =>
          mode === 'login' ? signInWithPassword({ email, password }) : signUp({ email, password })
        }
        onForgotPassword={openForgotPassword}
        onOAuth={(provider) => signInWithOAuth(provider)}
      />

      <ResetPasswordDialog
        isOpen={resetPasswordDialog.isOpen}
        onClose={resetPasswordDialog.close}
        onSubmit={(email) => void handleResetPassword(email)}
      />
    </div>
  );
}
