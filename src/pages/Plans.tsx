import { useNavigate } from 'react-router';

import { PricingSection, useFeatureAccess } from '@/features/premium';
import { useAuth } from '@/features/auth';
import { BackButton } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

export function Plans() {
  const { tier } = useFeatureAccess();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const currentTier = tier === 'guest' ? 'free' : tier;

  const handleSelectPlan = (selected: 'free' | 'premium') => {
    if (selected !== 'premium') return;
    if (!isAuthenticated) {
      toast.error('Log in to upgrade to Premium');
      return;
    }
    // Premium no se activa aquí — solo al guardar una tarjeta en manage-plan
    // (upgradeIntent hace que ese diálogo de pago se abra solo al llegar).
    void navigate('/dashboard/settings/manage-plan', { state: { upgradeIntent: true } });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <PricingSection currentTier={currentTier} onSelectPlan={handleSelectPlan} />
    </main>
  );
}
