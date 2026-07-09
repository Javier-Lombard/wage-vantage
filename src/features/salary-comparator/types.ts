/**
 * Domain types shared across this feature's api/, hooks/, and components/.
 * camelCase, post-transformResponse — components and hooks never see the raw
 * Supabase column-name shapes from api/wageApi.types.ts.
 */

export interface WageAggregation {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

/**
 * Endpoint output, pre-aggregation. `monthlyWages` is the raw matched set —
 * statistical derivation (min/Q1/median/Q3/max) happens in useWageStats, not
 * here, per architecture.md §4 and solid-principles/single-responsibility.md
 * ("api/ files do not... derive... that is downstream").
 */
export interface WageInsightsResult {
  monthlyWages: number[];
  /** Distinct values for the next field in the cascade — absent past the last step (Education Level). */
  options?: string[];
}

/** Closed set of genders the form offers — static, hardcoded options (see fieldConfig.ts). */
export type Gender = 'Male' | 'Female';

/** All 9 form values, keyed by field id — undefined until the user reaches and fills that field. */
export interface SalaryFormValues {
  country?: string;
  gender?: Gender;
  monthlyWage?: number;
  occupation?: string;
  occupationLevel?: string;
  economicActivity?: string;
  educationLevel?: string;
  yearsOfExperience?: string;
  companySize?: string;
}
