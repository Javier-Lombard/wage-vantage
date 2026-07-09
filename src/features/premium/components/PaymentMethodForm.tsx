import { useState } from 'react';
import { CreditCard } from 'lucide-react';

import { ActionDialog, Input } from '@/shared/components/ui';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { cardNumber: string; expiry: string; cvc: string }) => void;
  isLoading?: boolean;
}

export function PaymentMethodForm({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: PaymentMethodFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={CreditCard}
      title="Payment Method"
      description="Add or update the card used for your subscription."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{
        label: 'Save Card',
        onClick: () => onSave({ cardNumber, expiry, cvc }),
        isLoading,
      }}
    >
      <Input
        label="Card Number"
        value={cardNumber}
        onChange={(event) => setCardNumber(event.target.value)}
        placeholder="4242 4242 4242 4242"
      />
      <div className="flex gap-4">
        <Input
          label="Expiry"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          placeholder="MM/YY"
        />
        <Input
          label="CVC"
          value={cvc}
          onChange={(event) => setCvc(event.target.value)}
          placeholder="123"
        />
      </div>
    </ActionDialog>
  );
}
