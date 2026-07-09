import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { Icon } from './Icon';

interface BackButtonProps {
  to: string;
  label: string;
}

/**
 * Link de vuelta consistente para cabeceras de página en toda la jerarquía de
 * rutas (home → subdominios → sub-subdominios). No es un Button porque
 * navega (Link), no dispara una acción — mismo tratamiento visual que los
 * demás text-links (`text-muted`, hover a `text-foreground`).
 */
export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="text-muted hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
    >
      <Icon icon={ArrowLeft} size={16} />
      {label}
    </Link>
  );
}
