import type { Severity } from './types';

/** Severity colours as CSS variables. Separate from i18n so light pages do not pull in the dashboard dictionary. */
export const SEV_VAR: Record<Severity, string> = {
  Critical: 'var(--color-crit)',
  High: 'var(--color-high)',
  Medium: 'var(--color-med)',
  Low: 'var(--color-low)',
  Info: 'var(--color-info)',
};
