import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { prisma } from '@/lib/db';
import { loadScanDTO } from '@/lib/run-scan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/scans/:id  ->  scan status, live log and all assets. The dashboard polls this while a scan runs. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const { id } = await params;
  const scan = await loadScanDTO(id);
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  return NextResponse.json(scan);
}

/** DELETE /api/scans/:id  ->  remove a scan and its assets */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const { id } = await params;
  await prisma.scan.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
