import { AlertTriangle } from 'lucide-react';

import { ActionDialog, Badge, Button, Card, Text } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { formatCurrency } from '@/shared/lib/formatCurrency';
import { PLAN_CONFIG } from '../config';
import { BillingHistory } from './BillingHistory';
import { PaymentMethodPanel } from './PaymentMethodPanel';

import type { CardInfo } from '@/features/auth';
import type { Tier } from '../config';
import type { BillingHistoryEntry } from './BillingHistory';

interface ManagePlanPanelProps {
  tier: Extract<Tier, 'free' | 'premium'>;
  /** Solo aplica al plan Premium activo. */
  renewalDate?: string;
  billingEntries: BillingHistoryEntry[];
  card: CardInfo | null;
  onUpgrade: () => void;
  onCancelSubscription: () => void;
  onManagePayment: () => void;
  isCancelling?: boolean;
}

export function ManagePlanPanel({
  tier,
  renewalDate,
  billingEntries,
  card,
  onUpgrade,
  onCancelSubscription,
  onManagePayment,
  isCancelling = false,
}: ManagePlanPanelProps) {
  const plan = PLAN_CONFIG[tier];
  const isPremium = tier === 'premium';
  const cancelDialog = useDisclosure();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Text variant="h3">Manage Plan</Text>
        <Text variant="body-sm" className="text-muted">
          Your subscription and billing details
        </Text>
      </div>

      <Card className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Text variant="caption">Current Plan</Text>
          <div className="flex items-baseline gap-2">
            <Text variant="h4">{plan.name}</Text>
            <Text variant="body-sm" className="text-muted">
              {isPremium ? `${formatCurrency(plan.priceMonthly)}/month` : '0 €/month'}
            </Text>
          </div>
          <Text variant="body-sm" className="text-muted">
            {isPremium ? `Renews ${renewalDate}` : 'No active subscription — upgrade anytime.'}
          </Text>
        </div>
        {isPremium && <Badge variant="success">ACTIVE</Badge>}
      </Card>

      {!isPremium && (
        <Card interactive as="button" onClick={onUpgrade} className="border-accent-fg text-left">
          <Text variant="h5" className="text-accent-fg">
            Upgrade to Premium
          </Text>
          <Text variant="body-sm" className="text-muted mt-1">
            4 countries, unlimited exports & more — from{' '}
            {formatCurrency(PLAN_CONFIG.premium.priceMonthly)}/month
          </Text>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <BillingHistory entries={billingEntries} />
        <PaymentMethodPanel card={card} onManage={onManagePayment} />
      </div>

      {isPremium && (
        <Card className="flex flex-col gap-2">
          <Text variant="label">Cancel Subscription</Text>
          <Text variant="body-sm" className="text-muted">
            You'll keep Premium until your billing period ends.
          </Text>
          <Button variant="destructive-outline" onClick={cancelDialog.open} className="self-start">
            Cancel Subscription
          </Button>
        </Card>
      )}

      <ActionDialog
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        icon={AlertTriangle}
        tone="destructive"
        title="Cancel your subscription?"
        description="You'll keep Premium access until your current billing period ends, then your account reverts to the Free plan."
        secondaryAction={{ label: 'Keep Premium', onClick: cancelDialog.close }}
        primaryAction={{
          label: 'Cancel Subscription',
          onClick: () => {
            onCancelSubscription();
            cancelDialog.close();
          },
          isLoading: isCancelling,
        }}
      />
    </div>
  );
}
