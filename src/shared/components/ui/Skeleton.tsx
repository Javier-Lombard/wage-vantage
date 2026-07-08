import { cn } from '@/shared/lib/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Primitivo de carga sin dimensiones ni radio por defecto: `cn()` en este
 * proyecto no resuelve conflictos (no es tailwind-merge), así que un radio
 * hardcodeado aquí podría chocar de forma impredecible con el que pase quien
 * lo use. `bg-gray` es el token de DESIGN.md para "disabled/inactive states".
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-gray', className)} aria-hidden="true" />;
}
