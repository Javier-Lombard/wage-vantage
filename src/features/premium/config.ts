/** Los tres estados de la matriz de acceso (guest = no autenticado). */
export type Tier = 'guest' | 'free' | 'premium';

/**
 * Límites de la matriz Guest/Logged/Logged+Premium. `maxCountries` es el
 * total combinado (1 del FormLayout + N del CompareModal), no dos campos
 * separados — la UI que consuma esto decide cómo repartirlo entre el form y
 * el modal de comparación.
 */
export interface TierLimits {
  maxCountries: number;
  maxTemplates: number;
  chartViews: number;
  maxSavedComparisons: number;
  accurateData: boolean;
  canExport: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  guest: {
    maxCountries: 2,
    maxTemplates: 0,
    chartViews: 1,
    maxSavedComparisons: 0,
    accurateData: false,
    canExport: false,
  },
  free: {
    maxCountries: 2,
    maxTemplates: 1,
    chartViews: 1,
    maxSavedComparisons: 1,
    accurateData: false,
    canExport: false,
  },
  premium: {
    maxCountries: 3,
    maxTemplates: 4,
    chartViews: 3,
    maxSavedComparisons: 4,
    accurateData: true,
    canExport: true,
  },
};

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanConfig {
  tier: Extract<Tier, 'free' | 'premium'>;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  features: PlanFeature[];
}

/** Copy de PlanCard/PricingSection/UpgradeDialog — una sola fuente para ambos. */
export const PLAN_CONFIG: Record<'free' | 'premium', PlanConfig> = {
  free: {
    tier: 'free',
    name: 'Free',
    tagline: 'For quick, one-off comparisons',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      { label: '3 salary comparisons per month', included: true },
      { label: 'Access to 20 countries', included: true },
      { label: 'Basic cost-of-living index', included: true },
      { label: 'Email support', included: true },
    ],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    tagline: 'For anyone negotiating or job hunting',
    priceMonthly: 2.99,
    priceAnnual: 2.99 * 12 * (2 / 3), // "Save 33%" del mock de billing cycle
    features: [
      { label: 'Compare up to 4 countries at once', included: true },
      { label: 'Access to 190+ countries', included: true },
      { label: 'Full cost-of-living & tax breakdown', included: true },
      { label: 'Historical trends & export to PDF', included: true },
    ],
  },
};
