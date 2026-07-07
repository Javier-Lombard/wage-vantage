import { InfoSection } from '@/features/about';
import { Text } from '@/shared/components/ui';

export function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-16">
      <header className="mb-12">
        <Text variant="h1">Privacy & Terms</Text>
      </header>

      <div className="flex flex-col gap-8">
        <InfoSection title="Privacy">
          <p>
            We only store the data you explicitly save (templates and comparisons) under your
            account. Anonymous usage is not tracked beyond what's needed to run the calculator.
          </p>
        </InfoSection>

        <InfoSection title="Terms of use">
          <p>
            Wage Comparator is provided as-is for informational purposes. Salary comparisons are
            estimates and should not be treated as financial or legal advice.
          </p>
        </InfoSection>
      </div>
    </main>
  );
}
