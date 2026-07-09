import { Zap } from 'lucide-react';

import { ActionDialog, FeatureItem } from '@/shared/components/ui';
import { PLAN_CONFIG } from '../config';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  /** Título contextual del gate que disparó el upsell (p. ej. "Upgrade to export your comparison"). Por defecto, el genérico "Upgrade to Premium". */
  title?: string;
  /** Descripción contextual; por defecto no se muestra (solo la variante simple del mock). */
  description?: string;
  /** La variante "rica" del mock añade la lista de features del plan Premium. */
  showFeatureList?: boolean;
  isLoading?: boolean;
}

export function UpgradeDialog({
  isOpen,
  onClose,
  onUpgrade,
  title = 'Upgrade to Premium',
  description,
  showFeatureList = false,
  isLoading = false,
}: UpgradeDialogProps) {
  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Zap}
      tone="primary"
      title={title}
      description={
        description ??
        (showFeatureList
          ? 'Exporting is a Premium feature. Upgrade to unlock:'
          : 'You need a Premium plan to unlock this feature. Upgrade now to unlock this and many other features.')
      }
      secondaryAction={{ label: 'Maybe later', onClick: onClose }}
      primaryAction={{ label: 'Upgrade to Premium', onClick: onUpgrade, isLoading }}
    >
      {showFeatureList && (
        <ul className="flex flex-col gap-2">
          {PLAN_CONFIG.premium.features.map((feature) => (
            <FeatureItem key={feature.label} included={feature.included}>
              {feature.label}
            </FeatureItem>
          ))}
        </ul>
      )}
    </ActionDialog>
  );
}
