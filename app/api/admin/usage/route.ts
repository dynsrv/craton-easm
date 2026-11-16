import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { getUsageSummary } from '@/lib/ai/usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/usage -> aggregated AI usage and estimated cost. */
export async function GET() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const summary = await getUsageSummary();
  return NextResponse.json({ summary });
}
