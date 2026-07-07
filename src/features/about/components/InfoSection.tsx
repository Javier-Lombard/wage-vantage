import { Card, Text } from '@/shared/components/ui';

import type { ReactNode } from 'react';

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Panel reutilizable para las distintas secciones informativas de About
 * (sobre la web, privacidad, uso de datos, fuentes estadísticas...) — cada
 * sección es una instancia de este mismo panel, solo cambia el título y el
 * contenido de children.
 */
export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <Card className="flex flex-col gap-3">
      <Text variant="h4">{title}</Text>
      <div className="text-muted flex flex-col gap-2 text-sm">{children}</div>
    </Card>
  );
}
