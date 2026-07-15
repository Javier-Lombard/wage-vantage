import { useState } from 'react';
import { CreditCard } from 'lucide-react';

import { ActionDialog, Input } from '@/shared/components/ui';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { cardNumber: string; expiry: string; cvc: string }) => void;
  isLoading?: boolean;
}

interface FormErrors {
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

/** Agrupa en bloques de 4 mientras se escribe — solo dígitos, tope de 19 (rango real de PANs). */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Inserta la barra tras los primeros 2 dígitos (mes) mientras se escribe — MM/YY. */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvc(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

/** true si MM/YY ya venció (fin del mes indicado anterior a hoy). */
function isExpiryInPast(month: number, year: number): boolean {
  const fullYear = 2000 + year;
  const endOfMonth = new Date(fullYear, month, 0, 23, 59, 59);
  return endOfMonth < new Date();
}

function validate(values: { cardNumber: string; expiry: string; cvc: string }): FormErrors {
  const errors: FormErrors = {};

  const digitCount = values.cardNumber.replace(/\D/g, '').length;
  if (digitCount < 13 || digitCount > 19) {
    errors.cardNumber = 'Enter a valid card number';
  }

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(values.expiry);
  if (!expiryMatch) {
    errors.expiry = 'Enter a valid expiry (MM/YY)';
  } else {
    const month = Number(expiryMatch[1]);
    const year = Number(expiryMatch[2]);
    if (month < 1 || month > 12) {
      errors.expiry = 'Enter a valid expiry (MM/YY)';
    } else if (isExpiryInPast(month, year)) {
      errors.expiry = 'Card has expired';
    }
  }

  if (values.cvc.length < 3 || values.cvc.length > 4) {
    errors.cvc = 'Enter a valid CVC';
  }

  return errors;
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
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = () => {
    const values = { cardNumber, expiry, cvc };
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSave(values);
  };

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
        onClick: handleSubmit,
        isLoading,
      }}
    >
      <Input
        label="Card Number"
        value={cardNumber}
        onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
        placeholder="4242 4242 4242 4242"
        error={errors.cardNumber}
      />
      <div className="flex gap-4">
        <Input
          label="Expiry"
          value={expiry}
          onChange={(event) => setExpiry(formatExpiry(event.target.value))}
          placeholder="MM/YY"
          error={errors.expiry}
        />
        <Input
          label="CVC"
          value={cvc}
          onChange={(event) => setCvc(formatCvc(event.target.value))}
          placeholder="123"
          error={errors.cvc}
        />
      </div>
    </ActionDialog>
  );
}
