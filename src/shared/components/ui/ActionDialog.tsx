import { cn } from '@/shared/lib/cn';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { Modal } from './Modal';
import { Text } from './Typography';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Deriva el tono del IconBadge y el estilo del botón primario. */
type ActionDialogTone = 'default' | 'primary' | 'destructive';

/**
 * El botón primario reusa la variante `primary` de Button (fondo sólido) y
 * solo recolorea vía className para el caso destructivo — Button documenta
 * explícitamente que sus 4 variantes (DESIGN.md §7) son cerradas, así que no
 * se le añade una variante `destructive` nueva.
 */
const PRIMARY_BUTTON_TONE_CLASSES: Record<ActionDialogTone, string | undefined> = {
  default: undefined,
  primary: undefined,
  destructive: 'bg-error text-on-primary hover:bg-error/90',
};

interface ActionDialogAction {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

/**
 * Diálogo único que cubre todos los modales del mock (Delete, Sign in,
 * Upgrade, Save Template, Log in to save): icono circular + título +
 * descripción + botón secundario/primario, con children opcional para un
 * form (Input de nombre de template, selector de formato de export...) y un
 * footer opcional para el link "New here? Create an account". Cada feature
 * solo aporta copy/config a través de esta forma — nunca reimplementa el
 * layout del diálogo.
 */
interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  tone?: ActionDialogTone;
  title: string;
  description?: ReactNode;
  primaryAction: ActionDialogAction;
  secondaryAction?: ActionDialogAction;
  footer?: ReactNode;
  children?: ReactNode;
}

export function ActionDialog({
  isOpen,
  onClose,
  icon,
  tone = 'default',
  title,
  description,
  primaryAction,
  secondaryAction,
  footer,
  children,
}: ActionDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} aria-label={title}>
      <div className="flex flex-col gap-4">
        <IconBadge icon={icon} tone={tone} />

        <div className="flex flex-col gap-1">
          <Text variant="h5" as="h2">
            {title}
          </Text>
          {description && (
            <Text variant="body-sm" className="text-muted">
              {description}
            </Text>
          )}
        </div>

        {children}

        <div className="mt-2 flex items-center justify-end gap-3">
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              isLoading={secondaryAction.isLoading}
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={primaryAction.onClick}
            isLoading={primaryAction.isLoading}
            className={cn(PRIMARY_BUTTON_TONE_CLASSES[tone])}
          >
            {primaryAction.label}
          </Button>
        </div>

        {footer && <div className="text-center">{footer}</div>}
      </div>
    </Modal>
  );
}
