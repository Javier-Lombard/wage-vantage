import { DashboardGrid } from '@/features/auth';
import { RecentComparisonsPanel } from '@/features/comparison';
import { PLAN_CONFIG, useFeatureAccess } from '@/features/premium';
import { Text } from '@/shared/components/ui';

const MOCK_SAVED_COMPARISONS_COUNT = 0;
const MOCK_SAVED_TEMPLATES_COUNT = 0;

export function DashboardHome() {
  const { tier, limits } = useFeatureAccess();
  const planLabel = tier === 'premium' ? PLAN_CONFIG.premium.name : PLAN_CONFIG.free.name;

  return (
    <div className="flex flex-col gap-8">
      <Text variant="h2">Dashboard</Text>

      <DashboardGrid
        savedComparisonsCount={MOCK_SAVED_COMPARISONS_COUNT}
        savedTemplatesCount={MOCK_SAVED_TEMPLATES_COUNT}
        maxTemplates={limits.maxTemplates}
        planLabel={planLabel}
      />

      <RecentComparisonsPanel savedComparisonsCount={MOCK_SAVED_COMPARISONS_COUNT} />
    </div>
  );
}
