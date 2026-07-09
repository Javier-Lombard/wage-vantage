import type { User } from '@supabase/supabase-js';
import type { WageAggregation } from '@/features/salary-comparator';
import type { BillingHistoryEntry } from '@/features/premium';
import type { AppUser, CardInfo, SavedComparison, SavedTemplate, UserMetadata } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCardInfo(value: unknown): CardInfo | null {
  if (!isRecord(value)) return null;
  const { brand, last4, expiry } = value;
  if (typeof brand !== 'string' || typeof last4 !== 'string' || typeof expiry !== 'string') {
    return null;
  }
  return { brand, last4, expiry };
}

function parseTemplate(value: unknown): SavedTemplate | null {
  if (!isRecord(value)) return null;
  const { id, name, values } = value;
  if (typeof id !== 'string' || typeof name !== 'string' || !isRecord(values)) return null;
  return { id, name, values };
}

function parseBillingEntry(value: unknown): BillingHistoryEntry | null {
  if (!isRecord(value)) return null;
  const { id, date, description, amount } = value;
  if (
    typeof id !== 'string' ||
    typeof date !== 'string' ||
    typeof description !== 'string' ||
    typeof amount !== 'number'
  ) {
    return null;
  }
  return { id, date, description, amount };
}

function isWageAggregation(value: unknown): value is WageAggregation {
  if (!isRecord(value)) return false;
  return (['min', 'q1', 'median', 'q3', 'max'] as const).every(
    (key) => typeof value[key] === 'number',
  );
}

function parseComparison(value: unknown): SavedComparison | null {
  if (!isRecord(value)) return null;
  const { id, name, savedAt, selectedCountries, values } = value;
  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof savedAt !== 'string' ||
    !Array.isArray(selectedCountries) ||
    !isRecord(values)
  ) {
    return null;
  }
  const computedStats = Array.isArray(value.computedStats)
    ? value.computedStats.filter(isWageAggregation)
    : undefined;

  return {
    id,
    name,
    savedAt,
    selectedCountries: selectedCountries.filter((c): c is string => typeof c === 'string'),
    primaryCountry: typeof value.primaryCountry === 'string' ? value.primaryCountry : undefined,
    userWage: typeof value.userWage === 'number' ? value.userWage : undefined,
    values,
    computedStats,
  };
}

/**
 * Narra el user_metadata sin tipar de supabase-js al contrato UserMetadata.
 * Entradas con shape incompatible (p. ej. templates de una implementación
 * previa) se descartan en vez de romper — lectura defensiva, no adaptador.
 */
function parseMetadata(raw: Record<string, unknown>): UserMetadata {
  const metadata: UserMetadata = {};

  if (typeof raw.name === 'string') metadata.name = raw.name;
  if (typeof raw.avatarUrl === 'string') metadata.avatarUrl = raw.avatarUrl;
  if (typeof raw.premium === 'boolean') metadata.premium = raw.premium;

  if (isRecord(raw.payData) && Array.isArray(raw.payData.history)) {
    metadata.payData = {
      card: parseCardInfo(raw.payData.card),
      history: raw.payData.history
        .map(parseBillingEntry)
        .filter((entry): entry is BillingHistoryEntry => entry !== null),
    };
  }

  if (Array.isArray(raw.templates)) {
    metadata.templates = raw.templates
      .map(parseTemplate)
      .filter((t): t is SavedTemplate => t !== null);
  }

  if (Array.isArray(raw.comparisons)) {
    metadata.comparisons = raw.comparisons
      .map(parseComparison)
      .filter((c): c is SavedComparison => c !== null);
  }

  return metadata;
}

export function mapUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? null,
    metadata: parseMetadata(user.user_metadata),
  };
}
