import { CreditCard } from 'lucide-react';

import { Button, Card, Icon, Text } from '@/shared/components/ui';

import type { CardInfo } from '@/features/auth';

interface PaymentMethodPanelProps {
  /** `null` cuando no hay tarjeta guardada (plan Free). */
  card: CardInfo | null;
  onManage: () => void;
}

export function PaymentMethodPanel({ card, onManage }: PaymentMethodPanelProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Icon icon={CreditCard} size={24} className="text-muted" />
        <Text variant="label">Payment Method</Text>
      </div>

      {card ? (
        <Text variant="body-sm" className="text-muted">
          {card.brand} •••• {card.last4} · expires {card.expiry}
        </Text>
      ) : (
        <Text variant="body-sm" className="text-muted">
          No payment method on file.
        </Text>
      )}

      <Button variant="outline" onClick={onManage} className="self-start">
        {card ? 'Update' : '+ Add payment method'}
      </Button>
    </Card>
  );
}
