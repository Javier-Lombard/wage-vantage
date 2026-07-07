import { ArrowLeftRight, Bookmark, CreditCard, Shield, SlidersHorizontal } from 'lucide-react';

import { DashboardCard } from './DashboardCard';

interface DashboardGridProps {
  savedComparisonsCount: number;
  savedTemplatesCount: number;
  maxTemplates: number;
  planLabel: string;
}

/**
 * Las 5 cards del dashboard del mock. Los conteos/labels llegan por props
 * (sin fetch propio) — cuando exista el backend de templates/comparisons/
 * billing, la page que monte este grid es quien pasa los datos reales.
 */
export function DashboardGrid({
  savedComparisonsCount,
  savedTemplatesCount,
  maxTemplates,
  planLabel,
}: DashboardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DashboardCard
        icon={ArrowLeftRight}
        title="Saved Comparisons"
        subtitle={`${savedComparisonsCount} comparisons saved`}
        to="/dashboard/comparisons"
      />
      <DashboardCard
        icon={Bookmark}
        title="Saved Templates"
        subtitle={`${savedTemplatesCount} of ${maxTemplates} used`}
        to="/dashboard/templates"
      />
      <DashboardCard
        icon={CreditCard}
        title="Manage Plan & Billing"
        subtitle={planLabel}
        to="/dashboard/settings/manage-plan"
      />
      <DashboardCard
        icon={Shield}
        title="Account Settings"
        subtitle="Email, password, security"
        to="/dashboard/settings"
      />
      <DashboardCard
        icon={SlidersHorizontal}
        title="Preferences"
        subtitle="Currency, language, notifications"
        to="/dashboard/settings"
      />
    </div>
  );
}
