/**
 * Domain Utilities
 *
 * Handles the four-domain framework (Physical, Emotional, Mental, Spiritual)
 * with consistent case normalization and backward-compatible V1 alias mapping.
 */

export const DOMAINS = ['Physical', 'Emotional', 'Mental', 'Spiritual'] as const;
export type DomainKey = typeof DOMAINS[number];

// Keep Domain as an alias for backward compatibility with any existing callers.
export type Domain = DomainKey;

const DOMAIN_ALIASES: Record<string, DomainKey> = {
  body: 'Physical',
  mind: 'Mental',
  heart: 'Emotional',
  spirit: 'Spiritual',
  physical: 'Physical',
  emotional: 'Emotional',
  mental: 'Mental',
  spiritual: 'Spiritual',
};

/** Normalize a domain string to canonical V2 form, mapping V1 names where needed */
export function normalizeDomain(domain: string): DomainKey | null {
  return DOMAIN_ALIASES[domain.toLowerCase()] ?? null;
}

/** Normalize a domain_cards record so all keys use canonical V2 capitalization */
export function normalizeDomainCards(cards: Record<string, string> | null | undefined): Record<string, string> {
  if (!cards || Object.keys(cards).length === 0) return {};
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(cards)) {
    const normalizedKey = DOMAIN_ALIASES[key.toLowerCase()] ?? key;
    if (value) normalized[normalizedKey] = value;
  }
  return normalized;
}
