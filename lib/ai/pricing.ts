/**
 * Approximate list prices in USD per 1,000,000 tokens, used to ESTIMATE cost.
 * Token counts recorded from the API are exact; these rates are a convenience and
 * can drift from a provider's current pricing. Matched by exact id first, then by prefix.
 */
export interface Rate {
  in: number;
  out: number;
}

export const MODEL_RATES: Record<string, Rate> = {
  // OpenAI
  'gpt-5': { in: 1.25, out: 10 },
  'gpt-5-mini': { in: 0.25, out: 2 },
  'gpt-5-nano': { in: 0.05, out: 0.4 },
  'gpt-4o': { in: 2.5, out: 10 },
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'o3-mini': { in: 1.1, out: 4.4 },
  // Anthropic
  'claude-opus-5-5': { in: 15, out: 75 },
  'claude-sonnet-5-5': { in: 3, out: 15 },
  'claude-haiku-5-5': { in: 1, out: 5 },
  'claude-3-5-sonnet': { in: 3, out: 15 },
  'claude-3-5-haiku': { in: 0.8, out: 4 },
};

const DEFAULT_RATE: Rate = { in: 1, out: 5 };

/** Strip the "provider/" prefix a label may carry (e.g. "openai/gpt-5-mini"). */
function bareId(model: string): string {
  return model.includes('/') ? model.slice(model.indexOf('/') + 1) : model;
}

export function rateFor(model: string): Rate {
  const id = bareId(model);
  if (MODEL_RATES[id]) return MODEL_RATES[id];
  // Longest matching prefix wins, so "gpt-5-mini-2026" still maps to gpt-5-mini.
  const hit = Object.keys(MODEL_RATES)
    .filter((k) => id.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return hit ? MODEL_RATES[hit] : DEFAULT_RATE;
}

/** Estimated USD cost of one call. */
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const r = rateFor(model);
  return (inputTokens / 1_000_000) * r.in + (outputTokens / 1_000_000) * r.out;
}

/** Whether we have a real published rate for this model (vs. the generic fallback). */
export function hasKnownRate(model: string): boolean {
  const id = bareId(model);
  return !!MODEL_RATES[id] || Object.keys(MODEL_RATES).some((k) => id.startsWith(k));
}

/** Curated fallback catalogue, used when the provider's live model list is unavailable. */
export const MODEL_CATALOG: Record<'openai' | 'anthropic', string[]> = {
  openai: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4o-mini', 'o3-mini'],
  anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'],
};
