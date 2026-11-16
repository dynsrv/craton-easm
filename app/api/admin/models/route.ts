import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { getRuntimeConfig } from '@/lib/settings';
import { MODEL_CATALOG } from '@/lib/ai/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Fetch the provider's live model list with the stored key. Returns [] on any failure. */
async function liveModels(provider: 'openai' | 'anthropic', key: string): Promise<string[]> {
  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return [];
      const body = (await res.json()) as { data?: { id: string }[] };
      return (body.data ?? [])
        .map((m) => m.id)
        .filter((id) => /^(gpt-|o\d)/.test(id) && !/(embedding|whisper|tts|audio|image|dall-e|realtime|moderation|transcribe)/.test(id))
        .sort();
    }
    const res = await fetch('https://api.anthropic.com/v1/models?limit=100', {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { id: string }[] };
    return (body.data ?? []).map((m) => m.id).sort();
  } catch {
    return [];
  }
}

/** GET /api/admin/models?provider=openai|anthropic -> { models, source } */
export async function GET(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;

  const cfg = await getRuntimeConfig();
  const asked = new URL(req.url).searchParams.get('provider');
  const provider: 'openai' | 'anthropic' = asked === 'anthropic' ? 'anthropic' : asked === 'openai' ? 'openai' : cfg.provider ?? (cfg.openaiKey ? 'openai' : 'anthropic');
  const key = provider === 'openai' ? cfg.openaiKey : cfg.anthropicKey;

  const live = key ? await liveModels(provider, key) : [];
  if (live.length) return NextResponse.json({ provider, models: live, source: 'live' });
  return NextResponse.json({ provider, models: MODEL_CATALOG[provider], source: 'fallback' });
}
