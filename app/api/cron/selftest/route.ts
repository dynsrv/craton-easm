import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { capture, launchBrowser } from '@/lib/scanner/visual-triage';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/cron/selftest  (Authorization: Bearer CRON_SECRET)
 * Operator health check: starts headless Chromium and screenshots example.com. Returns status only.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || got.length !== expected.length || !timingSafeEqual(got, expected)) return new Response('Unauthorized', { status: 401 });

  const started = Date.now();
  try {
    const browser = await launchBrowser();
    if (!browser) return NextResponse.json({ ok: false, stage: 'launch', error: 'No Chromium found' });
    const launchedMs = Date.now() - started;
    try {
      const shot = await capture(browser, 'https://example.com/');
      return NextResponse.json({ ok: Boolean(shot), stage: 'capture', launchedMs, totalMs: Date.now() - started, bytes: shot?.jpeg.length ?? 0, title: shot?.title ?? null, node: process.version });
    } finally {
      await browser.close().catch(() => {});
    }
  } catch (err) {
    return NextResponse.json({ ok: false, stage: 'launch', error: String((err as Error).message).slice(0, 600), node: process.version });
  }
}
