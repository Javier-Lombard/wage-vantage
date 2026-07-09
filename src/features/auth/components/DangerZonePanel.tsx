import { AlertTriangle } from 'lucide-react';

import { ActionDialog, Button, Card, Text } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';

interface DangerZonePanelProps {
  onDeleteAccount: () => void;
  isLoading?: boolean;
}

/**
 * Panel separado del de settings: agrupa acciones irreversibles (por ahora solo
 * eliminar la cuenta) con su propia confirmación destructiva. La eliminación
 * está mockeada hasta que se conecte Supabase.
 */
export function DangerZonePanel({ onDeleteAccount, isLoading = false }: DangerZonePanelProps) {
  const confirmDialog = useDisclosure();

  return (
    <Card className="border-error/40 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Text variant="h4" className="text-error">
          Danger Zone
        </Text>
        <Text variant="body-sm" className="text-muted">
          Permanently delete your account and all associated data. This cannot be undone.
        </Text>
      </div>

      <div className="flex justify-end">
        <Button variant="destructive-outline" onClick={confirmDialog.open}>
          Delete account
        </Button>
      </div>

      <ActionDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        icon={AlertTriangle}
        tone="destructive"
        title="Delete your account?"
        description="This action cannot be undone. All your templates, comparisons and profile data will be permanently removed."
        secondaryAction={{ label: 'Cancel', onClick: confirmDialog.close }}
        primaryAction={{
          label: 'Delete account',
          onClick: () => {
            onDeleteAccount();
            confirmDialog.close();
          },
          isLoading,
        }}
      />
    </Card>
  );
}
