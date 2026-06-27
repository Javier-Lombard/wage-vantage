import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { wageApi } from '../../api/wageApi';
import { useSalaryFormState } from '../../hooks/useSalaryFormState';
import { useWageInsights } from '../../hooks/useWageInsights';
import { SalaryForm } from '../SalaryForm';
import { filterMockRows, MOCK_WAGE_ROWS } from './mockWageData';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Replaces both endpoints' queryFn with one reading from the in-memory
 * MOCK_WAGE_ROWS table instead of calling Supabase — same endpoint names,
 * same reducerPath, so every hook SalaryForm's tree calls
 * (useGetCountryOptionsQuery, useGetWageInsightsQuery) keeps working
 * unmodified. Storybook-only: production code never imports this file.
 */
wageApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCountryOptions: builder.query<string[], void>({
      queryFn: () => ({
        data: [...new Set(MOCK_WAGE_ROWS.map((row) => row.Country))].sort(),
      }),
    }),
    getWageInsights: builder.query<
      { monthlyWages: number[]; options?: string[] },
      { filters: Record<string, string>; nextOptionsField?: string }
    >({
      queryFn: ({ filters, nextOptionsField }) => {
        const rows = filterMockRows(filters);
        const monthlyWages = rows.map((row) => row['Monthly Wage']);
        const options = nextOptionsField
          ? [
              ...new Set(
                rows.map((row) => row[nextOptionsField as keyof (typeof rows)[number]] as string),
              ),
            ].sort()
          : undefined;
        return { data: { monthlyWages, options } };
      },
    }),
  }),
});

/**
 * Created once at module scope, not inside the decorator function — a
 * decorator re-runs on most Storybook re-renders (Controls sync, args
 * changes), and calling configureStore() there would hand <Provider> a
 * fresh, empty-cache store on every render, silently discarding selections.
 */
const mockStore = configureStore({
  reducer: { [wageApi.reducerPath]: wageApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(wageApi.middleware),
});

/** Wires useSalaryFormState (step/values) into SalaryForm's controlled props, exactly like a real page would. */
function InteractiveSalaryForm() {
  const { step, values, setFieldValue, goNext, goBack, canAdvance } = useSalaryFormState();
  const { data, isFetching, nextOptionsField } = useWageInsights(values);

  return (
    <SalaryForm
      step={step}
      values={values}
      onFieldChange={setFieldValue}
      onNext={goNext}
      onBack={goBack}
      canAdvance={canAdvance}
      fetchedOptions={data?.options}
      isFetchingOptions={isFetching}
      nextOptionsField={nextOptionsField}
    />
  );
}

const meta = {
  component: SalaryForm,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
} satisfies Meta<typeof SalaryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    step: 1,
    values: {},
    onFieldChange: () => {},
    onNext: () => {},
    onBack: () => {},
    canAdvance: false,
    fetchedOptions: undefined,
    isFetchingOptions: false,
    nextOptionsField: undefined,
  },
  render: () => <InteractiveSalaryForm />,
};
