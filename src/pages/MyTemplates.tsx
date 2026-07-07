import { useState } from 'react';

import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { Text } from '@/shared/components/ui';
import {
  DeleteTemplateDialog,
  SaveTemplateDialog,
  TemplatesGrid,
  type TemplateSummary,
} from '@/features/templates';
import { useFeatureAccess } from '@/features/premium';

const INITIAL_TEMPLATES: TemplateSummary[] = [
  { id: '1', name: 'Senior SWE - London vs Berlin', summary: 'Spain, Germany · 2 countries' },
];

export function MyTemplates() {
  const { limits } = useFeatureAccess();
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const saveDialog = useDisclosure();
  const deleteDialog = useDisclosure();

  return (
    <div className="flex flex-col gap-8">
      <Text variant="h2">My Templates</Text>

      <TemplatesGrid
        templates={templates}
        maxTemplates={limits.maxTemplates}
        onLoad={() => {}}
        onDelete={(id) => {
          setPendingDeleteId(id);
          deleteDialog.open();
        }}
        onAddNew={limits.maxTemplates > 0 ? saveDialog.open : undefined}
      />

      <SaveTemplateDialog
        isOpen={saveDialog.isOpen}
        onClose={saveDialog.close}
        onSave={(name) => {
          setTemplates((prev) => [...prev, { id: crypto.randomUUID(), name, summary: '' }]);
          saveDialog.close();
        }}
      />

      <DeleteTemplateDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onDelete={() => {
          setTemplates((prev) => prev.filter((template) => template.id !== pendingDeleteId));
          deleteDialog.close();
        }}
      />
    </div>
  );
}
