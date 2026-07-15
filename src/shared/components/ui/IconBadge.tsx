import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

import type { LucideIcon } from 'lucide-react';

/** Tonos cerrados usados en las cabeceras de diálogo y cards del mock. */
type IconBadgeTone = 'default' | 'primary' | 'destructive' | 'warning';

/**
 * Cada tono usa su token semántico en fondo tenue (15%) + el mismo token en
 * el icono, igual que Badge — así el círculo lee bien en ambos modos sin
 * introducir colores nuevos.
 */
const TONE_CLASSES: Record<IconBadgeTone, string> = {
  default: 'bg-surface-hover text-muted',
  primary: 'bg-accent-surface text-accent-fg',
  destructive: 'bg-error/15 text-error',
  warning: 'bg-warning/15 text-warning',
};

interface IconBadgeProps {
  icon: LucideIcon;
  tone?: IconBadgeTone;
  /** Diámetro del círculo en px; el icono se dimensiona a la mitad. */
  size?: number;
  className?: string;
}

export function IconBadge({ icon, tone = 'default', size = 48, className }: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        TONE_CLASSES[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon icon={icon} size={Math.round(size / 2)} />
    </div>
  );
}
