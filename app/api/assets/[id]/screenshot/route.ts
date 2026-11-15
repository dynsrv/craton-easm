import { requireUser } from '@/lib/auth/guard';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/** GET /api/assets/:id/screenshot -> the JPEG captured by visual triage (signed-in users only) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [auth, asset] = await Promise.all([requireUser(), prisma.asset.findUnique({ where: { id }, select: { screenshot: true } })]);
  if ('response' in auth) return auth.response;
  if (!asset?.screenshot) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(asset.screenshot), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, max-age=86400, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
