import type { ReactNode } from 'react';

/**
 * Gate genérico: no sabe nada de UpgradeDialog/AuthPromptDialog concretos
 * (esos llegan en la Fase 3) — solo decide qué rama renderizar según
 * `hasAccess`, que el caller deriva de useFeatureAccess().can(...). Cada
 * feature pasa su propio fallback (un botón que abre su ActionDialog de
 * upsell correspondiente), centralizando aquí únicamente la decisión
 * binaria de acceso, no el contenido del upsell.
 */
interface PremiumGateProps {
  hasAccess: boolean;
  fallback: ReactNode;
  children: ReactNode;
}

export function PremiumGate({ hasAccess, fallback, children }: PremiumGateProps) {
  return hasAccess ? children : fallback;
}
