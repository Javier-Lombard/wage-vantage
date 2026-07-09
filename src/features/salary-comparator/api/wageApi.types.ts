/**
 * Raw Supabase shapes — column names and casing exactly as they exist in
 * TABLE_0. Internal to api/; transformResponse is the boundary that converts
 * these into the feature's camelCase domain shapes in ../types.ts.
 */

/** The 6 columns that participate in the cascading filter chain, in chain order. */
export type WageFilterColumn =
  | 'Country'
  | 'Gender'
  | 'Occupation'
  | 'Occupation Level'
  | 'Economic Activity'
  | 'Education Level';

/** Accumulated filters sent to the parametric endpoint — a subset of the row shape. */
export type WageFilterParams = Partial<Record<WageFilterColumn, string>>;

/** A single TABLE_0 row, as Supabase returns it (only the columns this feature reads). */
export interface WageRow {
  Country: string;
  Gender: string;
  Occupation: string;
  'Occupation Level': string;
  'Economic Activity': string;
  'Education Level': string;
  'Monthly Wage': number;
}
