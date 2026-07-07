import type { WageFilterColumn } from '../api/wageApi.types';
import type { SalaryFormValues } from '../types';

/**
 * The 9 form fields as data, not JSX (OCP — see
 * .claude/skills/solid-principles/references/open-closed.md "Form steps").
 * Adding/reordering/regrouping a field means editing this array, never the
 * step-rendering components.
 *
 * Each variant only carries the properties its own fetch behavior needs —
 * forcing all 4 kinds into one shared shape would mean optional properties
 * that are meaningless for 2 of the 4 variants (Interface Segregation).
 */

interface FieldBase {
  id: keyof SalaryFormValues;
  label: string;
  step: 1 | 2 | 3;
}

/** Options come from the parametric endpoint, filtered by everything accumulated so far. */
interface FetchedOptionsField extends FieldBase {
  kind: 'combobox-fetched-options';
  /** The Supabase column this field's chosen value is sent as, once the user picks one. */
  filterColumn: WageFilterColumn;
}

/** Options are hardcoded, but choosing one still triggers a fetch (Gender). */
interface StaticButFiltersField extends FieldBase {
  kind: 'combobox-static-but-filters';
  filterColumn: WageFilterColumn;
  options: string[];
}

/** Options are hardcoded and never sent to Supabase (Years of Experience, Company Size). */
interface StaticNoFilterField extends FieldBase {
  kind: 'combobox-static-no-filter';
  options: string[];
}

/** Free numeric entry, local state only (Monthly Wage). */
interface NumberInputField extends FieldBase {
  kind: 'number-input';
}

export type SalaryFormField =
  | FetchedOptionsField
  | StaticButFiltersField
  | StaticNoFilterField
  | NumberInputField;

const YEARS_OF_EXPERIENCE_OPTIONS = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '200+ employees',
];

export const SALARY_FORM_FIELDS: SalaryFormField[] = [
  // Step 1
  {
    id: 'country',
    label: 'Country',
    step: 1,
    kind: 'combobox-fetched-options',
    filterColumn: 'Country',
  },
  {
    id: 'gender',
    label: 'Gender',
    step: 1,
    kind: 'combobox-static-but-filters',
    filterColumn: 'Gender',
    options: ['Male', 'Female'],
  },
  { id: 'monthlyWage', label: 'Monthly Wage', step: 1, kind: 'number-input' },

  // Step 2
  {
    id: 'occupation',
    label: 'Occupation',
    step: 2,
    kind: 'combobox-fetched-options',
    filterColumn: 'Occupation',
  },
  {
    id: 'occupationLevel',
    label: 'Occupation Level',
    step: 2,
    kind: 'combobox-fetched-options',
    filterColumn: 'Occupation Level',
  },
  {
    id: 'economicActivity',
    label: 'Economic Activity',
    step: 2,
    kind: 'combobox-fetched-options',
    filterColumn: 'Economic Activity',
  },

  // Step 3
  {
    id: 'educationLevel',
    label: 'Education Level',
    step: 3,
    kind: 'combobox-fetched-options',
    filterColumn: 'Education Level',
  },
  {
    id: 'yearsOfExperience',
    label: 'Years of Experience',
    step: 3,
    kind: 'combobox-static-no-filter',
    options: YEARS_OF_EXPERIENCE_OPTIONS,
  },
  {
    id: 'companySize',
    label: 'Company Size',
    step: 3,
    kind: 'combobox-static-no-filter',
    options: COMPANY_SIZE_OPTIONS,
  },
];
