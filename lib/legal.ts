/**
 * Operator details and service commitments shown on the legal pages and in the footer.
 * Change them here (or with the NEXT_PUBLIC_* variables); every page picks them up.
 */
export const OPERATOR = 'DynSrv';
export const PRODUCT = 'Craton';
export const SITE_HOST = 'security.digitalstrategy.id';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@digitalstrategy.id';
export const LEGAL_UPDATED = '2026-11-16';

/** Commitments quoted in the complaints and privacy pages. */
export const SLA = { ackDays: 3, resolveDays: 14, abuseHours: 48, dataRequestDays: 30 } as const;

export const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
export const BUILD = process.env.NEXT_PUBLIC_APP_BUILD ?? '';

export const LEGAL_SLUGS = ['terms', 'privacy', 'acceptable-use', 'liability', 'complaints'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];
