import { prisma } from '../db';
import { estimateCost } from './pricing';

export type AiOperation = 'triage' | 'brief' | 'attack-paths' | 'exploit';

/** Token usage as returned by the AI SDK (field names vary slightly by version). */
interface SdkUsage {
  inputTokens?: number;
  outputTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

/**
 * Record one AI call for the admin usage dashboard. Fire-and-forget:
 * a logging failure must never break triage, a brief or an exploit analysis.
 * `label` is the model label like "openai/gpt-5-mini"; we store provider and model separately.
 */
export async function logAiUsage(label: string, operation: AiOperation, usage: SdkUsage | undefined): Promise<void> {
  try {
    const inputTokens = usage?.inputTokens ?? usage?.promptTokens ?? 0;
    const outputTokens = usage?.outputTokens ?? usage?.completionTokens ?? 0;
    if (!inputTokens && !outputTokens) return;
    const [provider, model] = label.includes('/') ? [label.slice(0, label.indexOf('/')), label.slice(label.indexOf('/') + 1)] : ['unknown', label];
    await prisma.aiUsage.create({
      data: { provider, model, operation, inputTokens, outputTokens, costUsd: estimateCost(label, inputTokens, outputTokens) },
    });
  } catch {
    /* best effort */
  }
}

export interface UsageSummary {
  totals: { calls: number; inputTokens: number; outputTokens: number; costUsd: number };
  today: { calls: number; costUsd: number };
  last30d: { calls: number; costUsd: number };
  byOperation: { operation: string; calls: number; inputTokens: number; outputTokens: number; costUsd: number }[];
  byModel: { model: string; provider: string; calls: number; costUsd: number }[];
  daily: { date: string; costUsd: number; calls: number }[];
}

/** Aggregate recorded usage for the admin page. */
export async function getUsageSummary(): Promise<UsageSummary> {
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [all, byOp, byModel, recent] = await Promise.all([
    prisma.aiUsage.aggregate({ _sum: { inputTokens: true, outputTokens: true, costUsd: true }, _count: true }),
    prisma.aiUsage.groupBy({ by: ['operation'], _sum: { inputTokens: true, outputTokens: true, costUsd: true }, _count: true }),
    prisma.aiUsage.groupBy({ by: ['model', 'provider'], _sum: { costUsd: true }, _count: true }),
    prisma.aiUsage.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true, costUsd: true } }),
  ]);

  let todayCalls = 0;
  let todayCost = 0;
  let last30Cost = 0;
  const dayMap = new Map<string, { costUsd: number; calls: number }>();
  for (const r of recent) {
    last30Cost += r.costUsd;
    const day = r.createdAt.toISOString().slice(0, 10);
    const d = dayMap.get(day) ?? { costUsd: 0, calls: 0 };
    d.costUsd += r.costUsd;
    d.calls += 1;
    dayMap.set(day, d);
    if (r.createdAt >= startOfToday) {
      todayCalls += 1;
      todayCost += r.costUsd;
    }
  }

  return {
    totals: {
      calls: all._count,
      inputTokens: all._sum.inputTokens ?? 0,
      outputTokens: all._sum.outputTokens ?? 0,
      costUsd: all._sum.costUsd ?? 0,
    },
    today: { calls: todayCalls, costUsd: todayCost },
    last30d: { calls: recent.length, costUsd: last30Cost },
    byOperation: byOp
      .map((o) => ({ operation: o.operation, calls: o._count, inputTokens: o._sum.inputTokens ?? 0, outputTokens: o._sum.outputTokens ?? 0, costUsd: o._sum.costUsd ?? 0 }))
      .sort((a, b) => b.costUsd - a.costUsd),
    byModel: byModel.map((m) => ({ model: m.model, provider: m.provider, calls: m._count, costUsd: m._sum.costUsd ?? 0 })).sort((a, b) => b.costUsd - a.costUsd),
    daily: [...dayMap.entries()].map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
