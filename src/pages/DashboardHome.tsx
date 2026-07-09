import { DashboardGrid, useAuth } from '@/features/auth';
import { RecentComparisonsPanel } from '@/features/comparison';
import { PLAN_CONFIG, useFeatureAccess } from '@/features/premium';
import { BackButton, Text } from '@/shared/components/ui';

export function DashboardHome() {
  const { tier, limits } = useFeatureAccess();
  const { user } = useAuth();
  const planLabel = tier === 'premium' ? PLAN_CONFIG.premium.name : PLAN_CONFIG.free.name;
  const comparisons = user?.metadata.comparisons ?? [];
  const savedComparisonsCount = comparisons.length;
  const savedTemplatesCount = user?.metadata.templates?.length ?? 0;
  const recentComparisons = [...comparisons].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-8">
      <BackButton to="/" label="Back to home" />

      <Text variant="h2">Dashboard</Text>

      <DashboardGrid
        savedComparisonsCount={savedComparisonsCount}
        savedTemplatesCount={savedTemplatesCount}
        maxTemplates={limits.maxTemplates}
        planLabel={planLabel}
      />

      <RecentComparisonsPanel
        savedComparisonsCount={savedComparisonsCount}
        recentComparisons={recentComparisons}
      />
    </div>
  );
}
