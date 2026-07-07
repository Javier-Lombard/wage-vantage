import { useAuth } from '@/features/auth';
import { TIER_LIMITS } from '../config';

import type { Tier, TierLimits } from '../config';

export interface FeatureAccess {
  tier: Tier;
  isPremium: boolean;
  limits: TierLimits;
  /** Azúcar sobre `limits` para checks booleanos directos (export, datos precisos). */
  can: (feature: 'accurateData' | 'canExport') => boolean;
}

/**
 * Deriva el tier y sus límites a partir del auth context — la única fuente
 * de isAuthenticated/isPremium. No guarda estado propio: si el auth context
 * cambia (login real, demo toggle), este hook se recalcula solo.
 */
export function useFeatureAccess(): FeatureAccess {
  const { isAuthenticated, isPremium } = useAuth();

  const tier: Tier = isPremium ? 'premium' : isAuthenticated ? 'free' : 'guest';
  const limits = TIER_LIMITS[tier];

  return {
    tier,
    isPremium,
    limits,
    can: (feature) => limits[feature],
  };
}
