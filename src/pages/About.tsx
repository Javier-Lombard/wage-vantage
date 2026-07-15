import { BarChart3, Database, Globe2, Lock, Mail, ShieldCheck, Zap } from 'lucide-react';

import { FeatureCard, InfoSection } from '@/features/about';
import { BackButton, Text } from '@/shared/components/ui';

export function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <header className="mb-12">
        <Text variant="h1" className="mb-4">
          About Wage Comparator
        </Text>
        <Text variant="body-lg" className="text-muted">
          Understanding how your salary compares to wage distributions across Europe couldn't be
          easier or more precise. We make it visual, intuitive, and accessible — whether you're
          negotiating a raise, planning a move abroad, or just curious.
        </Text>
      </header>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeatureCard icon={BarChart3} title="Statistical Precision">
            Data and visualizations based on Eurostat-sourced wage distribution data across the EU.
          </FeatureCard>
          <FeatureCard icon={Globe2} title="Pan-European Coverage">
            Compare wages across 20+ European countries with data segregated by industry,
            occupation, and education.
          </FeatureCard>
          <FeatureCard icon={ShieldCheck} title="Privacy First">
            Your personal wage data is never shared. All comparisons are processed securely.
          </FeatureCard>
          <FeatureCard icon={Zap} title="Real-Time Insights">
            Dynamic charts update instantly as you input your details, giving immediate visual
            feedback.
          </FeatureCard>
        </div>

        <InfoSection title="Data Sources" icon={Database}>
          <p>
            Our wage data is sourced from Eurostat's Structure of Earnings Survey (SES) and
            complementary national statistical office publications. Data is updated quarterly and
            tied to the most recent pan-European employment reports.
          </p>
        </InfoSection>

        <InfoSection title="Privacy & Support" icon={Lock}>
          <Text variant="h5" className="text-foreground mt-2">
            Your Privacy
          </Text>
          <p>
            We collect only the minimum data necessary to provide the service: your account email
            (if you register) and any explicit data.
          </p>
          <p>
            Your wage inputs are never stored unless you choose to save them as a template or
            comparison sheet.
          </p>
          <p>We never (re-)sell, re-share your personal data with third parties.</p>
          <p>
            You have the right to request deletion of your account and all associated data at any
            time from your account settings.
          </p>

          <Text variant="h5" className="text-foreground mt-4">
            GDPR Rights
          </Text>
          <ul className="flex flex-col gap-1">
            <li>• Right to access your data</li>
            <li>• Right to have your data erased</li>
            <li>• Right to erasure ("right to be forgotten")</li>
            <li>• Right to data portability</li>
            <li>• Right to object to processing</li>
          </ul>

          <Text variant="h5" className="text-foreground mt-4">
            Frequently Asked Questions
          </Text>
          <div className="flex flex-col gap-4">
            <div>
              <Text variant="label" className="text-foreground">
                Where does the wage data come from?
              </Text>
              <p>
                Our wage data is sourced from Eurostat's Structure of Earnings Survey (SES),
                updated quarterly to reflect statistical distributions, broken down by
                jurisdiction.
              </p>
            </div>
            <div className="border-border-subtle border-t pt-4">
              <Text variant="label" className="text-foreground">
                How do I manage or cancel my subscription?
              </Text>
              <p>
                Navigate to "Manage Plan" to cancel your subscription at any time from the Manage
                Plan page in your Dashboard.
              </p>
            </div>
            <div className="border-border-subtle border-t pt-4">
              <Text variant="label" className="text-foreground">
                Is my data stored after a session?
              </Text>
              <p>For logged-in users, your explicitly saved templates and comparisons are retained.</p>
            </div>
            <div className="border-border-subtle border-t pt-4">
              <Text variant="label" className="text-foreground">
                What data do you collect?
              </Text>
              <p>We collect only your email and any form data you explicitly choose to save as a template or comparison sheet.</p>
            </div>
          </div>
        </InfoSection>

        <InfoSection title="Contact Support" icon={Mail}>
          <p>Have a question or need help? We're here for you.</p>
          <a href="mailto:support@wagecomparator.eu" className="text-accent-fg font-semibold">
            support@wagecomparator.eu
          </a>
        </InfoSection>
      </div>
    </main>
  );
}
