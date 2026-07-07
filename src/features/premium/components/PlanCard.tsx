import { Zap } from 'lucide-react';

import { Button, Card, FeatureItem, Icon, Text } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/formatCurrency';

import type { PlanConfig } from '../config';

interface PlanCardProps {
  plan: PlanConfig;
  /** Precio ya resuelto por el caller según el ciclo (mensual/anual) elegido en PricingSection. */
  price: number;
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

export function PlanCard({
  plan,
  price,
  isCurrentPlan,
  isRecommended = false,
  onSelect,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col gap-6',
        isRecommended && 'border-primary shadow-glow border-2',
      )}
    >
      {isRecommended && (
        <span className="bg-primary text-on-primary absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <Icon icon={Zap} size={14} />
          Recommended
        </span>
      )}

      <div className="flex flex-col gap-1">
        <Text variant="h4">{plan.name}</Text>
        <Text variant="body-sm" className="text-muted">
          {plan.tagline}
        </Text>
      </div>

      <div className="flex items-baseline gap-1">
        <Text variant="h1" as="span">
          {price === 0 ? '$0' : formatCurrency(price)}
        </Text>
        <Text variant="body-sm" className="text-muted">
          /month
        </Text>
      </div>

      <ul className="flex flex-col gap-3">
        {plan.features.map((feature) => (
          <FeatureItem key={feature.label} included={feature.included}>
            {feature.label}
          </FeatureItem>
        ))}
      </ul>

      <Button
        variant={isCurrentPlan ? 'outline' : 'primary'}
        onClick={onSelect}
        disabled={isCurrentPlan}
        className="mt-auto"
      >
        {isCurrentPlan ? 'Current plan' : `Upgrade to ${plan.name}`}
      </Button>
    </Card>
  );
}
