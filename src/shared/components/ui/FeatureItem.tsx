import { CheckCircle2, X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Fila de característica usada en listas de planes/feature comparisons
 * (PlanCard, UpgradeDialog). `included=false` atenúa el texto y cambia el
 * icono por defecto a X, para el caso "feature disabled" de la matriz de
 * tiers sin necesitar un componente aparte.
 */
interface FeatureItemProps {
  children: ReactNode;
  included?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function FeatureItem({ children, included = true, icon, className }: FeatureItemProps) {
  const ResolvedIcon = icon ?? (included ? CheckCircle2 : X);

  return (
    <li className={cn('flex items-center gap-3', className)}>
      <Icon
        icon={ResolvedIcon}
        size={20}
        className={included ? 'text-accent-fg' : 'text-muted'}
      />
      <span className={included ? 'text-foreground' : 'text-muted'}>{children}</span>
    </li>
  );
}
