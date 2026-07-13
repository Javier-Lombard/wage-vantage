import { Card, IconBadge, Text } from '@/shared/components/ui';

import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  children: string;
}

/**
 * Card de característica con icono, usada en la cuadrícula de 4 destacados al
 * principio de About (precisión estadística, cobertura, privacidad, tiempo
 * real) — distinta de InfoSection: más compacta, sin `flex-col gap-3` de
 * secciones largas, y con IconBadge en vez de solo texto.
 */
export function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <IconBadge icon={icon} tone="primary" size={40} />
      <Text variant="h5">{title}</Text>
      <Text variant="body-sm" className="text-muted">
        {children}
      </Text>
    </Card>
  );
}
