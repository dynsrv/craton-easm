import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Region of the database host (e.g. "ap-southeast-1"), never the host itself. */
function dbRegion(): string | null {
  try {
    const host = new URL(process.env.DATABASE_URL ?? '').hostname;
    return host.match(/(?:[a-z]{2}-[a-z]+-\d)/)?.[0] ?? null;
  } catch {
    return null;
  }
}

/** GET /api/ping -> function region and database round-trip time. Public; returns no data. */
export async function GET() {
  const times: number[] = [];
  let ok = true;
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      ok = false;
      break;
    }
    times.push(Math.round(performance.now() - t));
  }
  return NextResponse.json(
    { ok, functionRegion: process.env.VERCEL_REGION ?? 'local', dbRegion: dbRegion(), dbMs: times },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
