import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/guard';
import { HOST_CAP_MAX, HOST_CAP_MIN, SCAN_CAP_MAX } from '@/lib/auth/roles';
import { resolveSettings, saveSetting, SECRET_KEYS, SETTING_KEYS, type SettingKey } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface SettingView {
  key: SettingKey;
  secret: boolean;
  source: 'database' | 'env' | 'none';
  /** Plain value for non-secrets; for secrets only the last 4 characters. */
  display: string | null;
}

async function view(): Promise<SettingView[]> {
  const resolved = await resolveSettings();
  return SETTING_KEYS.map((key) => {
    const { value, source } = resolved[key];
    const secret = SECRET_KEYS.has(key);
    return { key, secret, source, display: value == null ? null : secret ? `••••${value.slice(-4)}` : value };
  });
}

/** GET /api/admin/settings -> current settings. Secret values never leave the server. */
export async function GET() {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ settings: await view() });
}

const Body = z.object({ values: z.partialRecord(z.enum(SETTING_KEYS), z.string().max(400).nullable()) });

/** PUT /api/admin/settings  { values: { KEY: "value" | null } }  -> null or "" removes the stored value */
export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });

  const provider = parsed.data.values.AI_PROVIDER;
  if (provider && !['openai', 'anthropic'].includes(provider)) return NextResponse.json({ error: 'AI_PROVIDER must be openai or anthropic.' }, { status: 400 });

  const hosts = parsed.data.values.MAX_HOSTS;
  if (hosts && !(Number.isInteger(Number(hosts)) && Number(hosts) >= HOST_CAP_MIN && Number(hosts) <= HOST_CAP_MAX)) {
    return NextResponse.json({ error: `Host limit must be a whole number from ${HOST_CAP_MIN} to ${HOST_CAP_MAX}.` }, { status: 400 });
  }

  const scans = parsed.data.values.MAX_SCANS;
  if (scans && !(Number.isInteger(Number(scans)) && Number(scans) >= 0 && Number(scans) <= SCAN_CAP_MAX)) {
    return NextResponse.json({ error: `Scan limit must be a whole number from 0 (unlimited) to ${SCAN_CAP_MAX}.` }, { status: 400 });
  }

  for (const [key, value] of Object.entries(parsed.data.values)) {
    await saveSetting(key as SettingKey, value ?? null, auth.session.email);
  }
  return NextResponse.json({ settings: await view() });
}
