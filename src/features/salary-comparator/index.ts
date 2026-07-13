export { wageApi } from './api/wageApi';
export { ComparisonCountryQuery } from './components/ComparisonCountryQuery';
export { MainChart } from './components/MainChart';
export { SalaryCalculator } from './components/SalaryCalculator';
export { SalaryForm } from './components/SalaryForm';
export { buildEnrichmentProfile } from './hooks/buildEnrichmentProfile';
export { buildWageFilters } from './hooks/buildWageFilters';
export { useSalaryFormState } from './hooks/useSalaryFormState';
export { useWageInsights } from './hooks/useWageInsights';
export { useWageStats } from './hooks/useWageStats';

export type { SalaryFormValues, WageAggregation, WageInsightsResult, Gender } from './types';
