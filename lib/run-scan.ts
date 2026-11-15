import type { Asset, Scan } from '@prisma/client';
import { generateBrief, triageAssets } from './ai/triage';
import { prisma } from './db';
import { discover } from './scanner';
import { surfaceScore } from './score';
import { getRuntimeConfig } from './settings';
import type { AssetDTO, Category, ExecutiveBrief, ScanDTO, Severity } from './types';

const MAX_LOG_LINES = 300;

/** Runs the full pipeline for an existing Scan row and keeps the row updated so the UI can poll it. */
export async function runScan(scanId: string): Promise<void> {
  const scan = await prisma.scan.findUnique({ where: { id: scanId } });
  if (!scan) return;
  const { domain } = scan;

  const log: string[] = [`$ craton scan ${domain}`];
  let phase = 0;
  // Progress callbacks fire concurrently; chain the writes so they land in order.
  let writes: Promise<unknown> = Promise.resolve();
  const progress = (nextPhase: number, message: string) => {
    phase = Math.max(phase, nextPhase);
    log.push(message);
    const snapshot = JSON.stringify(log.slice(-MAX_LOG_LINES));
    const p = phase;
    writes = writes.then(() => prisma.scan.update({ where: { id: scanId }, data: { status: 'running', phase: p, log: snapshot } })).catch(() => {});
  };

  try {
    const cfg = await getRuntimeConfig();
    // PHASE A
    const result = await discover(domain, (p) => progress(p.phase, p.message), { shodanKey: cfg.shodanKey });
    await writes;
    await prisma.asset.createMany({
      data: result.assets.map((a) => ({
        scanId,
        hostname: a.hostname,
        ips: JSON.stringify(a.ips),
        cname: a.cname,
        provider: a.provider,
        scheme: a.http?.scheme,
        httpStatus: a.http?.status,
        finalUrl: a.http?.finalUrl,
        title: a.http?.title,
        hasLoginForm: a.http?.hasLoginForm ?? false,
        server: a.http?.server,
        poweredBy: a.http?.poweredBy,
        hsts: a.http?.hsts ?? false,
        csp: a.http?.csp ?? false,
        tlsValid: a.http?.tls?.valid,
        tlsDaysLeft: a.http?.tls?.daysLeft,
        tlsIssuer: a.http?.tls?.issuer,
        tlsError: a.http?.tls?.error,
        ports: JSON.stringify(a.ports),
        cves: JSON.stringify(a.cves),
      })),
    });
    await prisma.scan.update({ where: { id: scanId }, data: { source: result.source, namesFound: result.namesFound } });

    // PHASE B
    progress(4, `AI triage of ${result.assets.length} assets`);
    const triage = await triageAssets(cfg, domain, result.assets, (m) => progress(4, m));
    await writes;
    await prisma.$transaction(
      triage.map((t) =>
        prisma.asset.updateMany({
          where: { scanId, hostname: t.hostname },
          data: {
            category: t.category,
            severity: t.severity,
            reasoningEn: t.exposureReasoning.en,
            reasoningId: t.exposureReasoning.id,
            remediationEn: t.remediationStep.en,
            remediationId: t.remediationStep.id,
            triageSource: t.source,
          },
        }),
      ),
    );

    // PHASE C
    const score = surfaceScore(triage.map((t) => t.severity));
    progress(5, 'Writing executive brief (EN + ID)');
    const brief = await generateBrief(cfg, domain, result.assets, triage, score);
    const sources = new Set(triage.map((t) => t.source));
    log.push(`  score ${score}/100, brief ready`);
    await writes;
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        phase: 6,
        score,
        brief: JSON.stringify(brief),
        triagedBy: sources.size > 1 ? 'mixed' : ([...sources][0] ?? 'heuristic'),
        log: JSON.stringify(log.slice(-MAX_LOG_LINES)),
        finishedAt: new Date(),
      },
    });
  } catch (err) {
    await writes;
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'failed', error: (err as Error).message.slice(0, 500), log: JSON.stringify(log.slice(-MAX_LOG_LINES)), finishedAt: new Date() },
    });
  }
}

/* ---------- row -> API shape ---------- */

const parse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

export function toAssetDTO(a: Asset): AssetDTO {
  return {
    id: a.id,
    hostname: a.hostname,
    ips: parse<string[]>(a.ips, []),
    cname: a.cname,
    provider: a.provider,
    scheme: a.scheme,
    httpStatus: a.httpStatus,
    finalUrl: a.finalUrl,
    title: a.title,
    hasLoginForm: a.hasLoginForm,
    server: a.server,
    poweredBy: a.poweredBy,
    hsts: a.hsts,
    csp: a.csp,
    tlsValid: a.tlsValid,
    tlsDaysLeft: a.tlsDaysLeft,
    tlsIssuer: a.tlsIssuer,
    tlsError: a.tlsError,
    ports: parse<number[]>(a.ports, []),
    cves: parse<string[]>(a.cves, []),
    category: a.category as Category | null,
    severity: a.severity as Severity | null,
    reasoning: a.reasoningEn ? { en: a.reasoningEn, id: a.reasoningId ?? a.reasoningEn } : null,
    remediation: a.remediationEn ? { en: a.remediationEn, id: a.remediationId ?? a.remediationEn } : null,
    triageSource: a.triageSource,
  };
}

export function toScanDTO(scan: Scan & { assets: Asset[] }): ScanDTO {
  return {
    id: scan.id,
    domain: scan.domain,
    status: scan.status as ScanDTO['status'],
    phase: scan.phase,
    log: parse<string[]>(scan.log, []),
    source: scan.source,
    namesFound: scan.namesFound,
    score: scan.score,
    brief: parse<ExecutiveBrief | null>(scan.brief, null),
    triagedBy: scan.triagedBy,
    error: scan.error,
    createdAt: scan.createdAt.toISOString(),
    finishedAt: scan.finishedAt?.toISOString() ?? null,
    assets: scan.assets.map(toAssetDTO),
  };
}
