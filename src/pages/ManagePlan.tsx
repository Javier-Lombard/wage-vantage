import { useNavigate } from 'react-router';

import { useAuth } from '@/features/auth';
import { ManagePlanPanel, useFeatureAccess } from '@/features/premium';
import { BackButton } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';

export function ManagePlan() {
  const { tier } = useFeatureAccess();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const isPremium = tier === 'premium';
  const billingEntries = user?.metadata.payData?.history ?? [];
  const card = user?.metadata.payData?.card ?? null;

  const handleCancelSubscription = async () => {
    try {
      await updateProfile({ premium: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel subscription.');
    }
  };

  return (
    <>
      <BackButton to="/dashboard/settings" label="Back to settings" />

      <ManagePlanPanel
        tier={isPremium ? 'premium' : 'free'}
        renewalDate={isPremium ? '2026-08-01' : undefined}
        billingEntries={billingEntries}
        card={card}
        onUpgrade={() => void navigate('/plans')}
        onCancelSubscription={() => void handleCancelSubscription()}
        onManagePayment={() => {}}
      />
    </>
  );
}
