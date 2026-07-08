import { useNavigate } from 'react-router';

import { PricingSection, useFeatureAccess } from '@/features/premium';
import { useAuth } from '@/features/auth';
import { BackButton } from '@/shared/components/ui';

export function Plans() {
  const { tier } = useFeatureAccess();
  const { setDemoTier } = useAuth();
  const navigate = useNavigate();

  const currentTier = tier === 'guest' ? 'free' : tier;

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <PricingSection
        currentTier={currentTier}
        onSelectPlan={(selected) => {
          if (selected === 'premium') {
            setDemoTier('premium');
            void navigate('/dashboard/settings/manage-plan');
          }
        }}
      />
    </main>
  );
}
