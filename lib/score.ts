import type { Severity } from './types';

/**
 * Attack Surface Score: 100 = nothing to fix, lower = more exposed.
 * Penalties add up per finding and decay exponentially, so the first Critical
 * hurts a lot and the score never goes negative.
 */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  Critical: 12,
  High: 5,
  Medium: 2,
  Low: 0.5,
  Info: 0,
};

export function surfaceScore(severities: (Severity | null | undefined)[]): number {
  const penalty = severities.reduce((sum, s) => sum + (s ? SEVERITY_WEIGHT[s] : 0), 0);
  return Math.round(100 * Math.exp(-penalty / 60));
}

export type GradeKey = 'g_good' | 'g_mod' | 'g_high' | 'g_crit';

export function grade(score: number): { key: GradeKey; severity: Severity } {
  if (score >= 80) return { key: 'g_good', severity: 'Low' };
  if (score >= 60) return { key: 'g_mod', severity: 'Medium' };
  if (score >= 40) return { key: 'g_high', severity: 'High' };
  return { key: 'g_crit', severity: 'Critical' };
}

export const SEVERITY_RANK: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
