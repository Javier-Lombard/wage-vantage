import { Card, Icon, Text } from '@/shared/components/ui';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InfoSectionProps {
  title: string;
  /** Icono opcional junto al título (Data Sources, Privacy & Support, Contact Support). */
  icon?: LucideIcon;
  children: ReactNode;
}

/**
 * Panel reutilizable para las distintas secciones informativas de About
 * (sobre la web, privacidad, uso de datos, fuentes estadísticas...) — cada
 * sección es una instancia de este mismo panel, solo cambia el título y el
 * contenido de children.
 */
export function InfoSection({ title, icon, children }: InfoSectionProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon && <Icon icon={icon} size={20} className="text-accent-fg" />}
        <Text variant="h4">{title}</Text>
      </div>
      <div className="text-muted flex flex-col gap-2 text-sm">{children}</div>
    </Card>
  );
}
