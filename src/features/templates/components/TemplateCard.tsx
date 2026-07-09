import { Trash2 } from 'lucide-react';

import { Button, Card, Icon, Text } from '@/shared/components/ui';

interface TemplateCardProps {
  name: string;
  summary: string;
  onLoad: () => void;
  onDelete: () => void;
}

export function TemplateCard({ name, summary, onLoad, onDelete }: TemplateCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Text variant="h5">{name}</Text>
          <Text variant="body-sm" className="text-muted">
            {summary}
          </Text>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete template ${name}`}
          className="text-muted hover:text-error hover:bg-surface-hover -m-1 cursor-pointer rounded-lg p-1 transition-colors"
        >
          <Icon icon={Trash2} size={20} />
        </button>
      </div>
      <Button variant="outline" onClick={onLoad}>
        Load Template
      </Button>
    </Card>
  );
}
