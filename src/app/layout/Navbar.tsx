import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { LogOut, Menu, Moon, Sun, UserCircle, X } from 'lucide-react';

import { useTheme } from '@/app/providers/useTheme';
import { AuthFlowDialogs, useAuth } from '@/features/auth';
import { Icon, Logo } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { cn } from '@/shared/lib/cn';
import { outlineButtonClasses } from '@/shared/lib/outlineButtonClasses';
import { toast } from '@/shared/lib/toast';

/** Closed set of primary nav destinations — extend here as routes are added. */
const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/plans', label: 'Plans' },
] as const;

const NAV_LINK_CLASSES = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-semibold transition-colors hover:text-foreground',
    isActive ? 'text-accent-fg' : 'text-muted',
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
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();
  const avatarUrl = isAuthenticated ? user?.metadata.avatarUrl : undefined;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const authDialog = useDisclosure();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const openAuthDialog = () => {
    setIsDrawerOpen(false);
    authDialog.open();
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setIsAccountMenuOpen((prev) => !prev);
    } else {
      openAuthDialog();
    }
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    try {
      await signOut();
      toast.success('Signed out');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign out.');
    }
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

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background">
      {/* Desktop bar (md and up) */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-8 py-4 md:flex lg:px-16">
        <Logo />

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
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              className={avatarUrl ? 'cursor-pointer rounded-full' : ICON_BUTTON_CLASSES}
              aria-label="Account"
              aria-expanded={isAccountMenuOpen}
              onClick={handleAccountClick}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Account"
                  className="border-border-subtle h-9 w-9 rounded-full border object-cover"
                />
              ) : (
                <Icon icon={UserCircle} size={24} />
              )}
            </button>

            {isAccountMenuOpen && (
              <div className="border-border-subtle bg-surface absolute right-0 top-full z-10 mt-2 flex w-44 flex-col gap-1 rounded-lg border p-2 shadow-lg">
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="hover:bg-surface-hover text-foreground rounded-md px-3 py-2 text-sm font-semibold transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="hover:bg-surface-hover text-error flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors"
                >
                  <Icon icon={LogOut} size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile collapsed header (below md) */}
      <div className="flex items-center justify-between px-4 py-4 md:hidden">
        <button
          type="button"
          className={avatarUrl ? 'cursor-pointer rounded-full' : ICON_BUTTON_CLASSES}
          aria-label="Account"
          onClick={() => {
            if (isAuthenticated) {
              setIsDrawerOpen(false);
              void navigate('/dashboard');
            } else {
              openAuthDialog();
            }
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Account"
              className="border-border-subtle h-9 w-9 rounded-full border object-cover"
            />
          ) : (
            <Icon icon={UserCircle} size={24} />
          )}
        </button>

        <Logo />

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

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    void handleSignOut();
                  }}
                  className={outlineButtonClasses()}
                >
                  <Icon icon={LogOut} />
                  Sign out
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthFlowDialogs isOpen={authDialog.isOpen} onClose={authDialog.close} />
    </header>
  );
}
