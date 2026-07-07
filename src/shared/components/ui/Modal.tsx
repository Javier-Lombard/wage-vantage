import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';
import { Text } from './Typography';

import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omitido cuando `children` ya compone su propia cabecera (p. ej. ActionDialog). */
  title?: string;
  /** Requerido cuando se omite `title`, para que el diálogo siga teniendo un aria-label. */
  'aria-label'?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Overlay + panel genérico, sin conocimiento de dominio (vive en shared/ui
 * para poder reusarse en premium-gate y otros flujos). Cierra con Escape y con
 * click en el backdrop; el panel detiene la propagación para que un click
 * interno no lo cierre. Se renderiza en un portal a <body> para escapar de
 * cualquier `overflow`/`transform` del árbol de la página.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  'aria-label': ariaLabel,
  children,
  className,
}: ModalProps) {
  // Escape cierra; se registra solo mientras está abierto para no dejar
  // listeners colgando ni interceptar Escape de otros componentes.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? ariaLabel}
        // El click dentro del panel no debe cerrar el modal.
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'border-border-subtle bg-surface relative w-full max-w-md rounded-2xl border p-6 shadow-xl',
          className,
        )}
      >
        <div className={cn('flex items-start justify-between gap-4', title && 'mb-6')}>
          {title && (
            <Text variant="h5" as="h2">
              {title}
            </Text>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              'text-muted hover:text-foreground hover:bg-surface-hover -m-1 cursor-pointer rounded-lg p-1 transition-colors',
              !title && 'absolute top-4 right-4',
            )}
          >
            <Icon icon={X} size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
