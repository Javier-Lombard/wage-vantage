import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '@/features/auth';
import {
  detectCardBrand,
  ManagePlanPanel,
  PaymentMethodForm,
  useFeatureAccess,
} from '@/features/premium';
import { BackButton } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { toast } from '@/shared/lib/toast';

import type { CardInfo } from '@/features/auth';

export function ManagePlan() {
  const { tier } = useFeatureAccess();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentDialog = useDisclosure();
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  // Capturado una sola vez al montar: PlanCard → "Upgrade to Premium" navega
  // aquí con este flag en vez de activar premium directamente — solo se
  // activa al guardar una tarjeta (ver handleSavePaymentMethod), nunca antes.
  const [isUpgradeFlow] = useState(() =>
    Boolean((location.state as { upgradeIntent?: boolean } | null)?.upgradeIntent),
  );

  const isPremium = tier === 'premium';
  const billingEntries = user?.metadata.payData?.history ?? [];
  const card = user?.metadata.payData?.card ?? null;

  useEffect(() => {
    if (isUpgradeFlow) {
      paymentDialog.open();
      // Limpia el state de navegación: un refresh o un back/forward no debe
      // reabrir el diálogo solo — el intento de upgrade es de un solo uso.
      void navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr al montar, isUpgradeFlow ya está capturado en el estado inicial
  }, []);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await updateProfile({ premium: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSavePaymentMethod = async (values: {
    cardNumber: string;
    expiry: string;
    cvc: string;
  }) => {
    setIsSavingCard(true);
    try {
      const digits = values.cardNumber.replace(/\D/g, '');
      const newCard: CardInfo = {
        brand: detectCardBrand(digits),
        last4: digits.slice(-4),
        expiry: values.expiry,
      };
      await updateProfile({
        ...(isUpgradeFlow ? { premium: true } : {}),
        payData: { card: newCard, history: billingEntries },
      });
      toast.success(
        isUpgradeFlow ? 'Payment method saved — welcome to Premium!' : 'Payment method saved',
      );
      paymentDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save payment method.');
    } finally {
      setIsSavingCard(false);
    }
  };

  return (
    <>
      <BackButton to="/dashboard" label="Back to dashboard" />

      <ManagePlanPanel
        tier={isPremium ? 'premium' : 'free'}
        renewalDate={isPremium ? '2026-08-01' : undefined}
        billingEntries={billingEntries}
        card={card}
        onUpgrade={() => void navigate('/plans')}
        onCancelSubscription={() => void handleCancelSubscription()}
        onManagePayment={paymentDialog.open}
        isCancelling={isCancelling}
      />

      <PaymentMethodForm
        isOpen={paymentDialog.isOpen}
        onClose={paymentDialog.close}
        onSave={(values) => void handleSavePaymentMethod(values)}
        isLoading={isSavingCard}
      />
    </>
  );
}
