import { Skeleton } from '@/shared/components/ui';

/** Sustituye el placeholder que MainChart mostraba mientras `isLoading || !aggregation`. */
export function SalaryCalculatorSkeleton() {
  return <Skeleton className="h-full min-h-80 w-full rounded-xl" />;
}
