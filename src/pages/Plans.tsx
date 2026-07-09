import { useNavigate } from 'react-router';

import { PricingSection, useFeatureAccess } from '@/features/premium';
import { useAuth } from '@/features/auth';
import { BackButton } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

export function Plans() {
  const { tier } = useFeatureAccess();
  const { isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();

  const currentTier = tier === 'guest' ? 'free' : tier;

  const handleSelectPlan = async (selected: 'free' | 'premium') => {
    if (selected !== 'premium') return;
    if (!isAuthenticated) {
      toast.error('Log in to upgrade to Premium');
      return;
    }
    try {
      await updateProfile({ premium: true });
      void navigate('/dashboard/settings/manage-plan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upgrade. Please try again.');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <PricingSection
        currentTier={currentTier}
        onSelectPlan={(selected) => void handleSelectPlan(selected)}
      />
    </main>
  );
}
