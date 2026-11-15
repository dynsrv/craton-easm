import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { authSecret } from './auth/session';
import { prisma } from './db';

/** Backend settings an admin can change at /admin. Database values override environment variables. */
export const SETTING_KEYS = ['AI_PROVIDER', 'TRIAGE_MODEL', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'SHODAN_API_KEY'] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export const SECRET_KEYS: ReadonlySet<SettingKey> = new Set(['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'SHODAN_API_KEY']);

function cipherKey(): Buffer {
  const secret = authSecret();
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return createHash('sha256').update(`craton-settings:${secret}`).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', cipherKey(), iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join(':');
}

export function decrypt(stored: string): string | null {
  try {
    const [v, iv, tag, body] = stored.split(':');
    if (v !== 'v1') return null;
    const decipher = createDecipheriv('aes-256-gcm', cipherKey(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null; // AUTH_SECRET was rotated: treat the value as unset
  }
}

export interface ResolvedSetting {
  value: string | null;
  source: 'database' | 'env' | 'none';
}

export async function resolveSettings(): Promise<Record<SettingKey, ResolvedSetting>> {
  const rows = await prisma.setting.findMany().catch(() => []);
  const stored = new Map(rows.map((r) => [r.key, decrypt(r.value)]));
  const out = {} as Record<SettingKey, ResolvedSetting>;
  for (const key of SETTING_KEYS) {
    const db = stored.get(key);
    const env = process.env[key]?.trim();
    out[key] = db ? { value: db, source: 'database' } : env ? { value: env, source: 'env' } : { value: null, source: 'none' };
  }
  return out;
}

export async function saveSetting(key: SettingKey, value: string | null, updatedBy: string): Promise<void> {
  const v = value?.trim();
  if (!v) {
    await prisma.setting.deleteMany({ where: { key } });
    return;
  }
  const data = { value: encrypt(v), updatedBy };
  await prisma.setting.upsert({ where: { key }, create: { key, ...data }, update: data });
}

/** What the scanner and the AI layer need for one run. */
export interface RuntimeConfig {
  provider: 'openai' | 'anthropic' | null; // null = pick whichever key exists, OpenAI first
  model: string | null;
  openaiKey: string | null;
  anthropicKey: string | null;
  shodanKey: string | null;
}

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const s = await resolveSettings();
  const provider = s.AI_PROVIDER.value?.toLowerCase();
  return {
    provider: provider === 'openai' || provider === 'anthropic' ? provider : null,
    model: s.TRIAGE_MODEL.value,
    openaiKey: s.OPENAI_API_KEY.value,
    anthropicKey: s.ANTHROPIC_API_KEY.value,
    shodanKey: s.SHODAN_API_KEY.value,
  };
}

/** Environment only, for the CLI script (no database). */
export function envRuntimeConfig(): RuntimeConfig {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  return {
    provider: provider === 'openai' || provider === 'anthropic' ? provider : null,
    model: process.env.TRIAGE_MODEL?.trim() || null,
    openaiKey: process.env.OPENAI_API_KEY || null,
    anthropicKey: process.env.ANTHROPIC_API_KEY || null,
    shodanKey: process.env.SHODAN_API_KEY || null,
  };
}
