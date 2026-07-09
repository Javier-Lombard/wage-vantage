import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '@/features/auth';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { BackButton, Text } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { DeleteTemplateDialog, TemplatesGrid, summarizeTemplate } from '@/features/templates';
import { useFeatureAccess } from '@/features/premium';

export function MyTemplates() {
  const { limits } = useFeatureAccess();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteDialog = useDisclosure();

  const templates = user?.metadata.templates ?? [];
  const templateSummaries = templates.map((template) => ({
    id: template.id,
    name: template.name,
    summary: summarizeTemplate(template.values),
  }));

  const handleDelete = async () => {
    try {
      await updateProfile({
        templates: templates.filter((template) => template.id !== pendingDeleteId),
      });
      deleteDialog.close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete template.');
    }
  };

  const handleLoad = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    void navigate('/', { state: { fastFillValues: template.values } });
  };

  return (
    <div className="flex flex-col gap-8">
      <BackButton to="/dashboard" label="Back to dashboard" />

      <Text variant="h2">My Templates</Text>

      <TemplatesGrid
        templates={templateSummaries}
        maxTemplates={limits.maxTemplates}
        onLoad={handleLoad}
        onDelete={(id) => {
          setPendingDeleteId(id);
          deleteDialog.open();
        }}
        onAddNew={limits.maxTemplates > templates.length ? () => void navigate('/') : undefined}
      />

      <DeleteTemplateDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onDelete={() => void handleDelete()}
      />
    </div>
  );
}
