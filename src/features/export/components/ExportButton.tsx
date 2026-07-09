import { Button } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { PremiumGate, UpgradeDialog, useFeatureAccess } from '@/features/premium';
import { ExportDialog } from './ExportDialog';

import type { ExportFormat } from './ExportDialog';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
}

/**
 * Único punto que conocen las páginas: decide, vía PremiumGate, si abrir el
 * selector de formato (ExportDialog) o el upsell (UpgradeDialog) — ambos
 * quedan desacoplados entre sí, PremiumGate es la única pieza que sabe que
 * uno sustituye al otro.
 */
export function ExportButton({ onExport }: ExportButtonProps) {
  const { can } = useFeatureAccess();
  const exportDialog = useDisclosure();
  const upgradeDialog = useDisclosure();

  return (
    <PremiumGate
      hasAccess={can('canExport')}
      fallback={
        <>
          <Button onClick={upgradeDialog.open}>Export</Button>
          <UpgradeDialog
            isOpen={upgradeDialog.isOpen}
            onClose={upgradeDialog.close}
            onUpgrade={upgradeDialog.close}
            title="Upgrade to export your comparison"
            showFeatureList
          />
        </>
      }
    >
      <Button onClick={exportDialog.open}>Export</Button>
      <ExportDialog
        isOpen={exportDialog.isOpen}
        onClose={exportDialog.close}
        onExport={(format) => {
          onExport(format);
          exportDialog.close();
        }}
      />
    </PremiumGate>
  );
}
