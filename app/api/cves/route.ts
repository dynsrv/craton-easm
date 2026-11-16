import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { CVE_ID, getCveDetails } from '@/lib/cve';

export const runtime = 'nodejs';

/** GET /api/cves?ids=CVE-2021-41773,CVE-2021-42013 -> severity, exploitation status and description for each. */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => CVE_ID.test(s))
    .slice(0, 60);
  const [auth, details] = await Promise.all([requireUser(), getCveDetails(ids, { max: 60, timeoutMs: 6000 })]);
  if ('response' in auth) return auth.response;
  return NextResponse.json({ cves: ids.map((id) => details.get(id) ?? null).filter(Boolean) }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
}
