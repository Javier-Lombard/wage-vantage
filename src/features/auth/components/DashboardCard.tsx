import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { Card, Icon, IconBadge, Text } from '@/shared/components/ui';

import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  to: string;
}

export function DashboardCard({ icon, title, subtitle, to }: DashboardCardProps) {
  return (
    <Card as={Link} to={to} interactive className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <IconBadge icon={icon} />
        <Icon icon={ChevronRight} className="text-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <Text variant="h4">{title}</Text>
        <Text variant="body-sm" className="text-muted">
          {subtitle}
        </Text>
      </div>
    </Card>
  );
}
