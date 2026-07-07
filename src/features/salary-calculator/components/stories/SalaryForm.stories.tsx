import { Provider } from 'react-redux';

import { store } from '@/app/store';

import { useSalaryFormState } from '../../hooks/useSalaryFormState';
import { useWageInsights } from '../../hooks/useWageInsights';
import { SalaryForm } from '../SalaryForm';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Uses the app's real store (same wageApi reducer/middleware as production)
 * so this story exercises the actual Supabase-backed endpoints — no mocked
 * queryFn. Requires VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env,
 * loaded by @storybook/react-vite the same way Vite loads them for the app.
 */

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
      <Provider store={store}>
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
