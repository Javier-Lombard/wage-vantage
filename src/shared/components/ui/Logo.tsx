import { cn } from '@/shared/lib/cn';

/**
 * Contorno de texto multiplataforma — no -webkit-text-stroke: esa propiedad
 * es WebKit-only y renderiza desalineada ("sombra fantasma") en el
 * compositor GPU de Chrome Android con fuentes bold/variables (Poppins 700).
 * text-shadow es CSS estándar (Blink/Gecko/WebKit): 8 sombras sin blur en las
 * direcciones cardinales + diagonales simulan un stroke uniforme de ~1.5px.
 * Se hereda a los dos <span> hijos (solo sobreescriben color, no
 * text-shadow), así que se declara una sola vez en el span contenedor.
 */
const LOGO_TEXT_OUTLINE = [
  '-1.5px -1.5px 0 var(--color-gray)',
  '1.5px -1.5px 0 var(--color-gray)',
  '-1.5px 1.5px 0 var(--color-gray)',
  '1.5px 1.5px 0 var(--color-gray)',
  '0 -1.5px 0 var(--color-gray)',
  '0 1.5px 0 var(--color-gray)',
  '-1.5px 0 0 var(--color-gray)',
  '1.5px 0 0 var(--color-gray)',
].join(', ');

interface LogoProps {
  /** 'large' es un 70% más grande que 'default' (navbar) — usado en el
   * placeholder de MainChart antes de que el usuario empiece el form. */
  size?: 'default' | 'large';
}

/**
 * SVG inline (no <img src="...">) para que el stroke de las barras pueda
 * leer var(--color-gray) y así cambiar con el tema, igual que el texto —
 * un <img> apuntando a un archivo .svg estático no puede reaccionar a las
 * variables CSS del documento que lo carga. favicon.svg es un archivo
 * aparte con el mismo dibujo: el navegador lo carga fuera de React, así
 * que ahí el borde se queda fijo (no puede ser mode-aware).
 */
function LogoIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" className={className} aria-hidden="true">
      <rect
        x={176}
        y={248}
        width={64}
        height={140}
        rx={32}
        fill="#DFFF88"
        stroke="var(--color-gray)"
        strokeWidth={18}
      />
      <rect
        x={272}
        y={140}
        width={64}
        height={248}
        rx={32}
        fill="#FFFFFF"
        stroke="var(--color-gray)"
        strokeWidth={18}
      />
    </svg>
  );
}

export function Logo({ size = 'default' }: LogoProps) {
  const isLarge = size === 'large';

  return (
    <div className="flex items-center gap-2">
      <LogoIcon className={cn(isLarge ? 'h-[3.4rem] w-[3.4rem]' : 'h-8 w-8')} />
      <span
        className={cn('font-bold tracking-wide', isLarge ? 'text-[2.125rem]' : 'text-xl')}
        style={{ textShadow: LOGO_TEXT_OUTLINE }}
      >
        <span className="text-white">wage</span>
        <span className="text-primary">comparator</span>
      </span>
    </div>
  );
}
