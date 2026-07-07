import { InfoSection } from '@/features/about';
import { Text } from '@/shared/components/ui';

export function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-16">
      <header className="mb-12">
        <Text variant="h1">About Wage Comparator</Text>
      </header>

      <div className="flex flex-col gap-8">
        <InfoSection title="About the project">
          <p>
            Wage Comparator helps you compare salaries across countries, adjusted for
            cost-of-living, so you can make informed decisions about relocation, remote work, or job
            offers.
          </p>
        </InfoSection>

        <InfoSection title="Data usage">
          <p>
            Salary figures you enter are used only to compute your comparison and are never shared
            with third parties. Saved comparisons and templates are private to your account.
          </p>
        </InfoSection>

        <InfoSection title="Statistical sources">
          <p>
            Cost-of-living and wage distribution data is aggregated from public statistical offices
            and cross-checked against multiple sources to minimize outliers.
          </p>
        </InfoSection>
      </div>
    </main>
  );
}
