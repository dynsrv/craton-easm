import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/guard';
import { prisma } from '@/lib/db';
import { normalizeDomain } from '@/lib/scanner/domain';

export const runtime = 'nodejs';

/** GET /api/monitors -> domains re-scanned daily */
export async function GET() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ monitors: await prisma.monitor.findMany({ orderBy: { domain: 'asc' } }) });
}

/** POST /api/monitors { domain, enabled } -> turn daily monitoring on or off */
export async function POST(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const parsed = z.object({ domain: z.string(), enabled: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Send { domain, enabled }.' }, { status: 400 });
  let domain: string;
  try {
    domain = normalizeDomain(parsed.data.domain);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
  const monitor = await prisma.monitor.upsert({
    where: { domain },
    create: { domain, enabled: parsed.data.enabled, createdBy: auth.session.email },
    update: { enabled: parsed.data.enabled },
  });
  return NextResponse.json({ monitor });
}
