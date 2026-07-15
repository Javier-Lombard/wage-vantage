import { useState } from 'react';

import { SegmentedControl, Text } from '@/shared/components/ui';
import { PLAN_CONFIG } from '../config';
import { PlanCard } from './PlanCard';

import type { Tier } from '../config';

type BillingCycle = 'monthly' | 'annual';

interface PricingSectionProps {
  currentTier: Extract<Tier, 'free' | 'premium'>;
  onSelectPlan: (tier: 'free' | 'premium') => void;
}

export function PricingSection({ currentTier, onSelectPlan }: PricingSectionProps) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Text variant="caption" className="text-accent-fg font-semibold tracking-wide uppercase">
          Pricing
        </Text>
        <Text variant="h1">Get the full salary picture</Text>
        <Text variant="body-lg" className="text-muted max-w-md">
          Start free, upgrade anytime. Cancel whenever — no long-term commitment.
        </Text>
      </div>

      <SegmentedControl
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: 'Annual' },
        ]}
        value={cycle}
        onChange={setCycle}
      />

      <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
        <PlanCard
          plan={PLAN_CONFIG.free}
          price={cycle === 'monthly' ? PLAN_CONFIG.free.priceMonthly : PLAN_CONFIG.free.priceAnnual}
          isCurrentPlan={currentTier === 'free'}
          onSelect={() => onSelectPlan('free')}
        />
        <PlanCard
          plan={PLAN_CONFIG.premium}
          price={
            cycle === 'monthly' ? PLAN_CONFIG.premium.priceMonthly : PLAN_CONFIG.premium.priceAnnual
          }
          isCurrentPlan={currentTier === 'premium'}
          isRecommended
          onSelect={() => onSelectPlan('premium')}
        />
      </div>
    </div>
  );
}
