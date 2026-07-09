import { Bookmark } from 'lucide-react';

import { Button, Icon, Text } from '@/shared/components/ui';
import { TemplateCard } from './TemplateCard';

export interface TemplateSummary {
  id: string;
  name: string;
  summary: string;
}

interface TemplatesGridProps {
  templates: TemplateSummary[];
  maxTemplates: number;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  /** Se oculta cuando ya se alcanzó el límite del tier — el gating lo decide el caller. */
  onAddNew?: () => void;
}

export function TemplatesGrid({
  templates,
  maxTemplates,
  onLoad,
  onDelete,
  onAddNew,
}: TemplatesGridProps) {
  const canAddMore = templates.length < maxTemplates && onAddNew;

  if (templates.length === 0) {
    return (
      <div className="border-border-subtle flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <Icon icon={Bookmark} size={24} className="text-muted" />
        <Text variant="body" className="text-muted">
          No saved templates yet.
        </Text>
        {onAddNew && <Button onClick={onAddNew}>Save your first template</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            name={template.name}
            summary={template.summary}
            onLoad={() => onLoad(template.id)}
            onDelete={() => onDelete(template.id)}
          />
        ))}
      </div>
      {canAddMore && (
        <Button variant="outline" onClick={onAddNew} className="self-start">
          Save new template ({templates.length}/{maxTemplates})
        </Button>
      )}
    </div>
  );
}
