import { useNavigate } from 'react-router';

import { useAuth } from '@/features/auth';
import { ManagePlanPanel, useFeatureAccess, type BillingHistoryEntry } from '@/features/premium';

const MOCK_BILLING_ENTRIES: BillingHistoryEntry[] = [
  { id: '1', date: '2026-06-01', description: 'Premium plan — monthly', amount: 2.99 },
  { id: '2', date: '2026-05-01', description: 'Premium plan — monthly', amount: 2.99 },
];

const MOCK_CARD = { brand: 'Visa', last4: '4242', expiry: '08/28' };

export function ManagePlan() {
  const { tier } = useFeatureAccess();
  const { setDemoTier } = useAuth();
  const navigate = useNavigate();

  const isPremium = tier === 'premium';

  return (
    <ManagePlanPanel
      tier={isPremium ? 'premium' : 'free'}
      renewalDate={isPremium ? '2026-08-01' : undefined}
      billingEntries={isPremium ? MOCK_BILLING_ENTRIES : []}
      card={isPremium ? MOCK_CARD : null}
      onUpgrade={() => void navigate('/plans')}
      onCancelSubscription={() => setDemoTier('free')}
      onManagePayment={() => {}}
    />
  );
}
