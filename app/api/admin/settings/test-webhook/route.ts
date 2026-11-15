import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isPublicIPv4 } from '@/lib/scanner/domain';
import { getRuntimeConfig } from '@/lib/settings';
import { lookup } from 'node:dns/promises';

export const runtime = 'nodejs';

/** POST /api/admin/settings/test-webhook -> sends one sample drift alert to ALERT_WEBHOOK_URL */
export async function POST() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const { alertWebhookUrl } = await getRuntimeConfig();
  if (!alertWebhookUrl) return NextResponse.json({ ok: false, message: 'No alert webhook URL is saved.' });

  let url: URL;
  try {
    url = new URL(alertWebhookUrl);
  } catch {
    return NextResponse.json({ ok: false, message: 'The saved webhook URL is not valid.' });
  }
  if (url.protocol !== 'https:') return NextResponse.json({ ok: false, message: 'The webhook URL must use https://.' });
  const addrs = await lookup(url.hostname, { all: true, family: 4 }).catch(() => []);
  if (!addrs.length || !addrs.every((a) => isPublicIPv4(a.address))) return NextResponse.json({ ok: false, message: 'The webhook host does not resolve to a public address.' });

  const payload = {
    source: 'craton-easm',
    type: 'attack_surface.drift.test',
    text: `Craton test alert from ${auth.session.email}. Real alerts list new hosts, open ports, expiring certificates and weakened SPF/DMARC.`,
    events: [{ kind: 'test', severity: 'High', hostname: 'example.co.id', detail: 'Sample event' }],
  };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(8000) });
    return NextResponse.json({ ok: res.ok, message: res.ok ? `Delivered (HTTP ${res.status}).` : `The webhook answered HTTP ${res.status}.` });
  } catch (err) {
    return NextResponse.json({ ok: false, message: `Could not reach the webhook: ${(err as Error).message.slice(0, 160)}` });
  }
}
