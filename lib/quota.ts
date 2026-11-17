import { isAdminRole } from './auth/roles';
import { prisma } from './db';
import { getRuntimeConfig } from './settings';

export interface ScanQuota {
  /** Scans allowed this month; null = unlimited. */
  limit: number | null;
  used: number;
  /** Start of next month (UTC), when the count resets. */
  resetsAt: string;
}

const monthStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const nextMonth = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

/** Effective monthly scan allowance for one account: its own limit, else the global default. Admins are unlimited. */
export async function scanQuota(userId: string): Promise<ScanQuota> {
  const [user, cfg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, maxScans: true } }),
    getRuntimeConfig(),
  ]);
  const raw = user?.maxScans ?? cfg.maxScans;
  const limit = isAdminRole(user?.role) || raw === 0 ? null : raw;
  const used = await prisma.scan.count({ where: { ownerId: userId, createdAt: { gte: monthStart() } } });
  return { limit, used, resetsAt: nextMonth().toISOString() };
}

export const overQuota = (q: ScanQuota) => q.limit !== null && q.used >= q.limit;

export function quotaMessage(q: ScanQuota): string {
  const when = new Date(q.resetsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  return `You have used all ${q.limit} scans for this month. The count resets on ${when}. Contact your administrator for a higher limit.`;
}
