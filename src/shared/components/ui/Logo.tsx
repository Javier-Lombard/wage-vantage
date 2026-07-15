import logoIcon from '@/shared/assets/logo-icon.svg';

import { cn } from '@/shared/lib/cn';

interface LogoProps {
  /** 'large' es un 70% más grande que 'default' (navbar) — usado en el
   * placeholder de MainChart antes de que el usuario empiece el form. */
  size?: 'default' | 'large';
}

export function Logo({ size = 'default' }: LogoProps) {
  const isLarge = size === 'large';

  return (
    <div className="flex items-center gap-2">
      <img src={logoIcon} alt="" className={cn(isLarge ? 'h-[3.4rem] w-[3.4rem]' : 'h-8 w-8')} />
      <span className={cn('font-bold tracking-tight', isLarge ? 'text-[2.125rem]' : 'text-xl')}>
        <span className="text-foreground">wage</span>
        <span className="text-primary">comparator</span>
      </span>
    </div>
  );
}
