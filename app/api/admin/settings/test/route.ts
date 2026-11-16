import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getModel } from '@/lib/ai/triage';
import { requireAdmin } from '@/lib/auth/guard';
import { getRuntimeConfig } from '@/lib/settings';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** POST /api/admin/settings/test -> makes one tiny LLM call with the saved configuration */
export async function POST() {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const llm = getModel(await getRuntimeConfig());
  if (!llm) return NextResponse.json({ ok: false, message: 'No AI key is configured. Scans will use rule-based triage.' });
  try {
    await generateText({ model: llm.model, prompt: 'Reply with the single word OK.', maxOutputTokens: 16, maxRetries: 0, abortSignal: AbortSignal.timeout(20_000) });
    return NextResponse.json({ ok: true, message: `${llm.label} responded.` });
  } catch (err) {
    return NextResponse.json({ ok: false, message: `${llm.label}: ${(err as Error).message.slice(0, 240)}` });
  }
}
