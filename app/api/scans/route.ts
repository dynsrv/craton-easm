import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import { ownedBy, requireUser } from '@/lib/auth/guard';
import { prisma } from '@/lib/db';
import { listScans, runScan } from '@/lib/run-scan';
import { normalizeDomain } from '@/lib/scanner/domain';

export const runtime = 'nodejs'; // dns, tls and Prisma need the Node runtime
export const maxDuration = 300;

const Body = z.object({
  domain: z.string().min(3).max(253),
  // The operator confirms they are allowed to assess this domain.
  authorized: z.literal(true),
});

/** POST /api/scans  { domain, authorized: true }  ->  { id } */
export async function POST(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Send { domain, authorized: true }. Confirm you are authorised to assess this domain.' }, { status: 400 });
  }

  let domain: string;
  try {
    domain = normalizeDomain(parsed.data.domain);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  // One scan per domain at a time keeps us polite towards crt.sh and the target.
  const active = await prisma.scan.findFirst({
    where: { ...ownedBy(auth.session), domain, status: { in: ['queued', 'running'] }, createdAt: { gt: new Date(Date.now() - 10 * 60_000) } },
  });
  if (active) return NextResponse.json({ id: active.id, reused: true });

  const scan = await prisma.scan.create({ data: { domain, ownerId: auth.session.userId } });
  // Run after the response is sent. Works on `next dev` / `next start`; on serverless hosts
  // the function stays alive up to maxDuration. For heavier use, move this to a queue worker.
  after(() => runScan(scan.id));
  return NextResponse.json({ id: scan.id }, { status: 202 });
}

/** GET /api/scans  ->  the 20 most recent scans (without assets) */
export async function GET() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ scans: await listScans(ownedBy(auth.session)) });
}
