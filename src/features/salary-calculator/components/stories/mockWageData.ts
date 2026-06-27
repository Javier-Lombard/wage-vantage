import type { WageFilterColumn, WageFilterParams, WageRow } from '../../api/wageApi.types';

/**
 * Tiny in-memory stand-in for TABLE_0, used only by SalaryForm.stories.tsx's
 * mocked endpoints — a handful of rows per column, enough to prove the
 * cascade filters/narrows correctly without a real Supabase call.
 */
export const MOCK_WAGE_ROWS: WageRow[] = [
  {
    Country: 'Spain',
    Gender: 'Male',
    Occupation: 'Software Engineer',
    'Occupation Level': 'Senior',
    'Economic Activity': 'Information Technology',
    'Education Level': 'Tertiary',
    'Monthly Wage': 3800,
  },
  {
    Country: 'Spain',
    Gender: 'Female',
    Occupation: 'Software Engineer',
    'Occupation Level': 'Mid',
    'Economic Activity': 'Information Technology',
    'Education Level': 'Tertiary',
    'Monthly Wage': 3200,
  },
  {
    Country: 'Spain',
    Gender: 'Male',
    Occupation: 'Data Analyst',
    'Occupation Level': 'Junior',
    'Economic Activity': 'Finance',
    'Education Level': 'Postgraduate',
    'Monthly Wage': 2400,
  },
  {
    Country: 'France',
    Gender: 'Female',
    Occupation: 'Software Engineer',
    'Occupation Level': 'Senior',
    'Economic Activity': 'Information Technology',
    'Education Level': 'Tertiary',
    'Monthly Wage': 4500,
  },
  {
    Country: 'France',
    Gender: 'Male',
    Occupation: 'Product Manager',
    'Occupation Level': 'Mid',
    'Economic Activity': 'Information Technology',
    'Education Level': 'Postgraduate',
    'Monthly Wage': 4100,
  },
  {
    Country: 'Germany',
    Gender: 'Male',
    Occupation: 'Data Analyst',
    'Occupation Level': 'Mid',
    'Economic Activity': 'Manufacturing',
    'Education Level': 'Tertiary',
    'Monthly Wage': 3600,
  },
];

const FILTER_COLUMNS: WageFilterColumn[] = [
  'Country',
  'Gender',
  'Occupation',
  'Occupation Level',
  'Economic Activity',
  'Education Level',
];

export function filterMockRows(filters: WageFilterParams): WageRow[] {
  return MOCK_WAGE_ROWS.filter((row) =>
    FILTER_COLUMNS.every((column) => {
      const filterValue = filters[column];
      return filterValue === undefined || row[column] === filterValue;
    }),
  );
}
