import type { SalaryFormValues, WageAggregation } from '@/features/salary-comparator';
import type { BillingHistoryEntry } from '@/features/premium';

/**
 * Todo el estado de usuario vive en auth.users.raw_user_meta_data (no hay
 * tablas profiles/subscriptions) — este es el contrato tipado de ese JSON.
 * Todos los campos son opcionales: los usuarios de Google solo traen claims
 * OIDC hasta que se inicializan explícitamente vía updateProfile.
 */
export interface CardInfo {
  brand: string;
  last4: string;
  expiry: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  values: SalaryFormValues;
}

export interface SavedComparison {
  id: string;
  name: string;
  savedAt: string;
  selectedCountries: string[];
  primaryCountry?: string;
  userWage?: number;
  values: SalaryFormValues;
  computedStats?: WageAggregation[];
}

export interface UserMetadata {
  name?: string;
  avatarUrl?: string;
  premium?: boolean;
  payData?: { card: CardInfo | null; history: BillingHistoryEntry[] };
  templates?: SavedTemplate[];
  comparisons?: SavedComparison[];
}

export interface AppUser {
  id: string;
  email: string | null;
  metadata: UserMetadata;
}
