import { timingSafeEqual } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import pLimit from 'p-limit';
import { prisma } from '@/lib/db';
import { overQuota, scanQuota } from '@/lib/quota';
import { runScan } from '@/lib/run-scan';

export const runtime = 'nodejs';
export const maxDuration = 300;

/** Domains handled per run. Each scan opens its own headless browser, so keep this small. */
const PER_RUN = 3;
const MIN_HOURS_BETWEEN_SCANS = 20;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization') ?? '';
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

/**
 * GET /api/cron/monitor  (called by Vercel Cron, see vercel.json)
 * Re-scans the monitored domains that are due, oldest first. Each completed scan is compared with
 * the previous one and high-severity drift is posted to the alert webhook.
 */
export async function GET(req: Request) {
  if (!authorized(req)) return new Response('Unauthorized', { status: 401 });

  const due = await prisma.monitor.findMany({
    where: { enabled: true, OR: [{ lastRunAt: null }, { lastRunAt: { lt: new Date(Date.now() - MIN_HOURS_BETWEEN_SCANS * 3600_000) } }] },
    orderBy: { lastRunAt: { sort: 'asc', nulls: 'first' } },
    take: PER_RUN,
  });

  const scans: { id: string; domain: string }[] = [];
  for (const m of due) {
    const running = await prisma.scan.findFirst({ where: { domain: m.domain, status: { in: ['queued', 'running'] } } });
    if (running) continue;
    // Monitored re-scans count against the owner's monthly allowance, so a daily monitor cannot bypass it.
    if (m.ownerId && overQuota(await scanQuota(m.ownerId))) continue;
    scans.push(await prisma.scan.create({ data: { domain: m.domain, ownerId: m.ownerId } }));
    await prisma.monitor.update({ where: { domain: m.domain }, data: { lastRunAt: new Date() } });
  }

  const limit = pLimit(PER_RUN);
  after(() => Promise.all(scans.map((s) => limit(() => runScan(s.id)))));
  return NextResponse.json({ started: scans.map((s) => s.domain) });
}
