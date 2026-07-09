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
      { label: 'Compare up to 2 countries at a time', included: true },
      { label: 'Save 1 form as a template', included: true },
      { label: 'Save 1 comparison', included: true },
      { label: "Can't export comparisons", included: false },
      { label: 'One chart view per comparison', included: true },
      { label: 'Limited data on the comparison sheet', included: true },
    ],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    tagline: 'For anyone negotiating or job hunting',
    priceMonthly: 2.99,
    priceAnnual: 1.99,
    features: [
      { label: 'Compare up to 3 countries at a time', included: true },
      { label: 'Save up to 4 templates', included: true },
      { label: 'Save up to 4 comparisons', included: true },
      { label: 'Unlimited exports — PDF, CSV, or PNG', included: true },
      { label: 'Multiple chart views per comparison', included: true },
      { label: 'Full, accurate data — including wage history trends', included: true },
    ],
  },
};
