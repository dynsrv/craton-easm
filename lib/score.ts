import type { Severity } from './types';

/**
 * Attack Surface Score: 100 = nothing to fix, lower = more exposed.
 *
 * Calibration (v2): Critical and High findings are the real risk, so they keep
 * a full, linear penalty. Medium and Low findings are mostly hygiene and often
 * repeat across hosts, so they saturate (diminishing returns) instead of
 * stacking forever. A large, otherwise tidy estate is no longer scored as
 * critical just because it has many small findings. The score still never goes
 * negative and one Critical is still clearly felt.
 *
 * Reference profiles (Critical/High/Medium/Low -> score):
 *   0/0/2/6 -> 92   0/2/5/12 -> 76   0/5/10/20 -> 59   1/4/8/15 -> 53
 *   3/7/10/15 -> 30   6/10/3/4 -> 16   10/20/0/0 -> 5
 */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  Critical: 12,
  High: 4,
  Medium: 2,
  Low: 0.5,
  Info: 0,
};

/** Maximum penalty Medium and Low findings can add in total. */
const MEDIUM_CAP = 14;
const LOW_CAP = 4;
const DECAY = 65;

const saturate = (raw: number, cap: number) => cap * (1 - Math.exp(-raw / cap));

export function surfaceScore(severities: (Severity | null | undefined)[]): number {
  const count: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
  for (const s of severities) if (s) count[s]++;
  const penalty =
    count.Critical * SEVERITY_WEIGHT.Critical +
    count.High * SEVERITY_WEIGHT.High +
    saturate(count.Medium * SEVERITY_WEIGHT.Medium, MEDIUM_CAP) +
    saturate(count.Low * SEVERITY_WEIGHT.Low, LOW_CAP);
  return Math.round(100 * Math.exp(-penalty / DECAY));
}

export type GradeKey = 'g_good' | 'g_mod' | 'g_high' | 'g_crit';

export function grade(score: number): { key: GradeKey; severity: Severity } {
  if (score >= 80) return { key: 'g_good', severity: 'Low' };
  if (score >= 60) return { key: 'g_mod', severity: 'Medium' };
  if (score >= 40) return { key: 'g_high', severity: 'High' };
  return { key: 'g_crit', severity: 'Critical' };
}

export const SEVERITY_RANK: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
