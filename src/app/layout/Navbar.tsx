import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { Menu, Moon, Sun, UserCircle, X } from 'lucide-react';

import { useTheme } from '@/app/providers/useTheme';
import { AuthDialog } from '@/features/auth';
import { Icon, Text } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { cn } from '@/shared/lib/cn';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';

/** Closed set of primary nav destinations — extend here as routes are added. */
const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/plans', label: 'Plans' },
] as const;

const NAV_LINK_CLASSES = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-semibold transition-colors hover:text-foreground',
    isActive ? 'text-primary' : 'text-muted',
  );

/**
 * Button primitive only ships pill-CTA padding (px-6 py-3) — no icon-only
 * variant exists yet, so square icon triggers (theme toggle, hamburger,
 * drawer close) use a plain button with the same ghost-state tokens instead
 * of fighting Button's fixed padding with overrides.
 */
const ICON_BUTTON_CLASSES = cn(
  'inline-flex items-center justify-center rounded-full p-2 text-muted transition-colors cursor-pointer',
  'hover:bg-surface-hover hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Auth mockeada: el avatar siempre abre el login (logged=false permanente).
  const authDialog = useDisclosure();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const openAuthDialog = () => {
    setIsDrawerOpen(false);
    authDialog.open();
  };

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background">
      {/* Desktop bar (md and up) */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-8 py-4 md:flex lg:px-16">
        <Text as="span" variant="h5" className="text-foreground">
          Wage Comparator
        </Text>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={NAV_LINK_CLASSES}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className={ICON_BUTTON_CLASSES}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            <Icon icon={theme === 'dark' ? Sun : Moon} />
          </button>
          <button
            type="button"
            className={ICON_BUTTON_CLASSES}
            aria-label="Account"
            onClick={openAuthDialog}
          >
            <Icon icon={UserCircle} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile collapsed header (below md) */}
      <div className="flex items-center justify-between px-4 py-4 md:hidden">
        <button
          type="button"
          className={ICON_BUTTON_CLASSES}
          aria-label="Account"
          onClick={openAuthDialog}
        >
          <Icon icon={UserCircle} size={24} />
        </button>
        <button
          type="button"
          className={ICON_BUTTON_CLASSES}
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Icon icon={Menu} />
        </button>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-background/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 right-0 z-50 flex w-3/4 max-w-xs flex-col gap-8 bg-surface p-6 shadow-lg md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  className={ICON_BUTTON_CLASSES}
                  aria-label="Close menu"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <Icon icon={X} />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={NAV_LINK_CLASSES}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* Outline con contraste en light (sobre el drawer claro el primary no destaca). */}
              <button type="button" onClick={toggleTheme} className={outlineButtonClasses()}>
                <Icon icon={theme === 'dark' ? Sun : Moon} />
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/*
       * Auth aún mockeada: onSubmit/onForgotPassword son no-ops hasta que se
       * conecte Supabase; el diálogo solo sirve como entrada visual desde el avatar.
       */}
      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={authDialog.close}
        onSubmit={() => {}}
        onForgotPassword={() => {}}
      />
    </header>
  );
}
