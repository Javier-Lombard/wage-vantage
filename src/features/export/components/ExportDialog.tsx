import { useState } from 'react';
import { Download } from 'lucide-react';

import { ActionDialog } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

export type ExportFormat = 'pdf' | 'png' | 'csv';

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  png: 'PNG',
  csv: 'CSV',
};

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
}

/** Solo se monta para usuarios con acceso — el gating lo decide ExportButton. */
export function ExportDialog({ isOpen, onClose, onExport, isLoading = false }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');

  return (
    <ActionDialog
      isOpen={isOpen}
      onClose={onClose}
      icon={Download}
      title="Export comparison"
      description="Choose a format for your comparison sheet."
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Export', onClick: () => onExport(format), isLoading }}
    >
      <div role="radiogroup" aria-label="Export format" className="flex gap-2">
        {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((value) => {
          const isActive = value === format;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setFormat(value)}
              className={cn(
                'flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-accent-fg bg-accent-surface text-accent-fg'
                  : 'border-border text-muted hover:text-foreground',
              )}
            >
              {FORMAT_LABELS[value]}
            </button>
          );
        })}
      </div>
    </ActionDialog>
  );
}
