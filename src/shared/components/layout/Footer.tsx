import { Code } from 'lucide-react';

import { Icon, Text } from '@/shared/components/ui';

const PROJECT_NAME = 'Wage Comparator';
const GITHUB_URL = 'https://github.com/Javier-Lombard/wage-vantage';

const FOOTER_LINK_CLASSES =
  'text-sm font-semibold text-muted transition-colors hover:text-foreground';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-8 py-6 md:flex-row md:justify-between lg:px-16">
        <Text as="span" variant="caption">
          © {year} {PROJECT_NAME}
        </Text>

        <div className="flex items-center gap-6">
          <a href="/privacy" className={FOOTER_LINK_CLASSES}>
            Privacy & Terms
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <Icon icon={Code} size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
