import type { Asset, DriftEvent, Exposure, Scan } from '@prisma/client';
import { generateAttackPaths } from './ai/attack-paths';
import { generateBrief, triageAssets } from './ai/triage';
import { prisma } from './db';
import { redact, redactText } from './redact';
import { discover } from './scanner';
import { buildSnapshot, recordDrift, sendDriftAlert } from './scanner/drift';
import { checkBuckets, checkEmailSecurity, emailFindings, searchPublicCode } from './scanner/exposure-leaks';
import { detectTakeovers } from './scanner/takeover';
import { visualTriage } from './scanner/visual-triage';
import { SEVERITY_RANK, surfaceScore } from './score';
import { getRuntimeConfig } from './settings';
import { isPortNoise, trustedPorts } from './ports';
import type { AssetDTO, AttackPath, Bilingual, Category, DriftEventDTO, EmailSecurity, ExecutiveBrief, ExposureDTO, ExposureFinding, ExposureKind, ScanDTO, ScanListItem, Severity, Triage, VisualClass, VisualResult } from './types';

const MAX_LOG_LINES = 300;

/** Pipeline phases, shown as the progress list in the UI. */
export const PHASE = { ct: 0, dns: 1, http: 2, ports: 3, exposures: 4, visual: 5, triage: 6, paths: 7, drift: 8, done: 9 } as const;

const SCREENSHOT_RETENTION = 3; // keep screenshots for the latest N scans per domain

const raise = (s: Severity, floor: Severity): Severity => (SEVERITY_RANK[s] > SEVERITY_RANK[floor] ? floor : s);

/** Exposures shaped like triage rows, so the executive brief can weigh them alongside assets. */
function exposureAsTriage(e: ExposureFinding): Triage {
  const category: Category = e.kind === 'email' ? 'Mail / VPN / Infra' : 'Shadow IT / Forgotten Asset';
  return { hostname: e.hostname ?? e.target, category, severity: e.severity, exposureReasoning: e.reasoning, remediationStep: e.remediation, source: 'heuristic' };
}

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
    log.push(redact(message).text);
    const snapshot = JSON.stringify(log.slice(-MAX_LOG_LINES));
    const p = phase;
    writes = writes.then(() => prisma.scan.update({ where: { id: scanId }, data: { status: 'running', phase: p, log: snapshot } })).catch(() => {});
  };

  try {
    const cfg = await getRuntimeConfig();

    // PHASE A: discovery
    const result = await discover(domain, (p) => progress(p.phase, p.message), { shodanKey: cfg.shodanKey, otxKey: cfg.otxKey });
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
        title: redactText(a.http?.title),
        hasLoginForm: a.http?.hasLoginForm ?? false,
        server: a.http?.server,
        poweredBy: a.http?.poweredBy,
        hsts: a.http?.hsts ?? false,
        csp: a.http?.csp ?? false,
        tlsValid: a.http?.tls?.valid,
        tlsDaysLeft: a.http?.tls?.daysLeft,
        tlsIssuer: a.http?.tls?.issuer,
        tlsError: a.http?.tls?.error,
        ports: JSON.stringify(a.portsRaw ?? a.ports),
        cves: JSON.stringify(a.cves),
        cpes: JSON.stringify(a.cpes),
      })),
    });
    await prisma.scan.update({ where: { id: scanId }, data: { source: result.source, namesFound: result.namesFound } });

    // MODULES 1 + 3: takeover, public code, buckets, email security (independent, run together)
    progress(PHASE.exposures, 'Checking dangling DNS, public code, cloud storage and email security');
    const internalHosts = result.assets.map((a) => a.hostname).filter((h) => /(stag|dev|uat|test|sandbox|internal|preprod)/.test(h.split('.')[0]));
    const log4 = (m: string) => progress(PHASE.exposures, m);
    const [takeovers, codeLeaks, buckets, email] = await Promise.all([
      detectTakeovers(result.records, result.cnameOnly, log4).catch(() => []),
      searchPublicCode(domain, internalHosts, cfg.githubToken, log4).catch(() => []),
      checkBuckets(domain, log4).catch(() => []),
      checkEmailSecurity(domain).catch(() => null),
    ]);
    const exposures: ExposureFinding[] = [...takeovers, ...codeLeaks, ...buckets, ...(email ? emailFindings(domain, email) : [])];
    if (!takeovers.length) log4('  no dangling DNS records found');
    if (email) log4(`  email: SPF ${email.spf.policy}, DMARC ${email.dmarc.policy}`);
    await writes;
    if (exposures.length) {
      await prisma.exposure.createMany({
        data: exposures.map((e) => ({
          scanId, kind: e.kind, severity: e.severity, hostname: e.hostname, provider: e.provider, target: e.target, evidence: redact(e.evidence).text,
          titleEn: e.title.en, titleId: e.title.id, reasoningEn: e.reasoning.en, reasoningId: e.reasoning.id, remediationEn: e.remediation.en, remediationId: e.remediation.id,
        })),
      });
    }
    await prisma.scan.update({ where: { id: scanId }, data: { emailSecurity: email ? JSON.stringify(email) : null } });

    // MODULE 2: screenshots and visual classification
    progress(PHASE.visual, 'Visual triage of high-priority web hosts');
    const visual = await visualTriage(cfg, result.assets, (m) => progress(PHASE.visual, m)).catch((err: Error) => {
      progress(PHASE.visual, `  visual triage failed: ${err.message.slice(0, 120)}`);
      return [] as VisualResult[];
    });
    const visualByHost = new Map(visual.map((v) => [v.hostname, v]));
    for (const a of result.assets) {
      const v = visualByHost.get(a.hostname);
      if (v) a.visual = { visualClass: v.visualClass, product: v.product, anomalies: v.anomalies.map((x) => x.en) };
    }
    await writes;
    for (const v of visual) {
      await prisma.asset.updateMany({
        where: { scanId, hostname: v.hostname },
        data: {
          visualClass: v.visualClass,
          visualProduct: v.product,
          visualAnomalies: JSON.stringify(v.anomalies),
          screenshot: v.screenshot ? new Uint8Array(v.screenshot) : null,
          screenshotAt: v.screenshot ? new Date() : null,
        },
      });
    }

    // PHASE B: AI triage, with the visual class in context
    progress(PHASE.triage, `AI triage of ${result.assets.length} assets`);
    const triage = (await triageAssets(cfg, domain, result.assets, (m) => progress(PHASE.triage, m))).map((t) => {
      const v = visualByHost.get(t.hostname);
      if (v?.visualClass === 'Exposed Admin / DevOps Panel') return { ...t, severity: raise(t.severity, 'High') };
      if (v?.visualClass === 'Unauthenticated API Docs') return { ...t, severity: raise(t.severity, 'Medium') };
      return t;
    });
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

    // MODULE 4 + PHASE C: attack paths, score, executive brief
    progress(PHASE.paths, 'Chaining findings into attack paths');
    const actionableExposures = exposures.filter((e) => e.severity !== 'Info');
    const score = surfaceScore([...triage.map((t) => t.severity), ...actionableExposures.map((e) => e.severity)]);
    const [attackPaths, brief] = await Promise.all([
      generateAttackPaths(cfg, domain, result.assets, triage, visual, exposures),
      generateBrief(cfg, domain, result.assets, [...triage, ...actionableExposures.map(exposureAsTriage)], score),
    ]);
    progress(PHASE.paths, `  ${attackPaths.length} attack path(s); score ${score}/100; brief ready (EN + ID)`);

    // MODULE 5: drift against the previous scan of this domain, then alert
    progress(PHASE.drift, 'Comparing with the previous scan');
    const assetRows = await prisma.asset.findMany({ where: { scanId }, select: { hostname: true, ports: true, tlsDaysLeft: true, severity: true } });
    const snapshot = buildSnapshot(
      assetRows.map((r) => ({ hostname: r.hostname, ports: trustedPorts(JSON.parse(r.ports) as number[]), tlsDaysLeft: r.tlsDaysLeft, severity: r.severity as Severity | null })),
      email,
      exposures,
    );
    const drift = await recordDrift(scanId, domain, snapshot);
    if (!drift.baselineScanId) progress(PHASE.drift, '  first scan of this domain: saved as the baseline');
    else progress(PHASE.drift, `  ${drift.changes.length} change(s) since the previous scan`);
    if (drift.changes.some((c) => c.severity === 'High' || c.severity === 'Critical')) {
      const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null;
      const sent = await sendDriftAlert(cfg.alertWebhookUrl, domain, scanId, appUrl);
      progress(PHASE.drift, sent === 'sent' ? '  alert sent to webhook' : sent === 'failed' ? '  webhook alert failed (check ALERT_WEBHOOK_URL)' : '  no webhook configured');
    }

    const sources = new Set(triage.map((t) => t.source));
    log.push('  done');
    await writes;
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        phase: PHASE.done,
        score,
        brief: JSON.stringify(brief),
        attackPaths: JSON.stringify(attackPaths),
        baselineScanId: drift.baselineScanId,
        triagedBy: sources.size > 1 ? 'mixed' : ([...sources][0] ?? 'heuristic'),
        log: JSON.stringify(log.slice(-MAX_LOG_LINES)),
        finishedAt: new Date(),
      },
    });
    await pruneScreenshots(domain);
  } catch (err) {
    await writes;
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'failed', error: (err as Error).message.slice(0, 500), log: JSON.stringify(log.slice(-MAX_LOG_LINES)), finishedAt: new Date() },
    });
  }
}

/** Screenshots are the bulk of the database: keep them only for the most recent scans of each domain. */
async function pruneScreenshots(domain: string) {
  const older = await prisma.scan.findMany({ where: { domain }, orderBy: { createdAt: 'desc' }, skip: SCREENSHOT_RETENTION, select: { id: true } });
  if (older.length) await prisma.asset.updateMany({ where: { scanId: { in: older.map((s) => s.id) }, screenshot: { not: null } }, data: { screenshot: null, screenshotAt: null } });
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
    ports: trustedPorts(parse<number[]>(a.ports, [])),
    portNoise: isPortNoise(parse<number[]>(a.ports, [])) ? parse<number[]>(a.ports, []).length : 0,
    cves: parse<string[]>(a.cves, []),
    cpes: parse<string[]>(a.cpes, []),
    category: a.category as Category | null,
    severity: a.severity as Severity | null,
    reasoning: a.reasoningEn ? { en: a.reasoningEn, id: a.reasoningId ?? a.reasoningEn } : null,
    remediation: a.remediationEn ? { en: a.remediationEn, id: a.remediationId ?? a.remediationEn } : null,
    triageSource: a.triageSource,
    visualClass: a.visualClass as VisualClass | null,
    visualProduct: a.visualProduct,
    visualAnomalies: parse<Bilingual[]>(a.visualAnomalies, []),
    hasScreenshot: a.screenshotAt != null,
  };
}

export function toExposureDTO(e: Exposure): ExposureDTO {
  return {
    id: e.id,
    kind: e.kind as ExposureKind,
    severity: e.severity as Severity,
    hostname: e.hostname,
    provider: e.provider,
    target: e.target,
    evidence: e.evidence,
    title: { en: e.titleEn, id: e.titleId },
    reasoning: { en: e.reasoningEn, id: e.reasoningId },
    remediation: { en: e.remediationEn, id: e.remediationId },
  };
}

export function toDriftDTO(d: DriftEvent): DriftEventDTO {
  return {
    id: d.id,
    scanId: d.scanId,
    kind: d.kind,
    severity: d.severity as Severity,
    hostname: d.hostname,
    detail: { en: d.detailEn, id: d.detailId },
    createdAt: d.createdAt.toISOString(),
    notifiedAt: d.notifiedAt?.toISOString() ?? null,
  };
}

/** Asset columns without the screenshot bytes: those are served by /api/assets/:id/screenshot. */
export const ASSET_SELECT = {
  id: true, scanId: true, hostname: true, ips: true, cname: true, provider: true, scheme: true, httpStatus: true, finalUrl: true, title: true,
  hasLoginForm: true, server: true, poweredBy: true, hsts: true, csp: true, tlsValid: true, tlsDaysLeft: true, tlsIssuer: true, tlsError: true,
  ports: true, cves: true, cpes: true, category: true, severity: true, reasoningEn: true, reasoningId: true, remediationEn: true, remediationId: true,
  triageSource: true, visualClass: true, visualProduct: true, visualAnomalies: true, screenshotAt: true,
} as const;

/** Loads a scan with everything the dashboard shows. */
export async function loadScanDTO(id: string): Promise<ScanDTO | null> {
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: { assets: { select: ASSET_SELECT, orderBy: { hostname: 'asc' } }, exposures: true },
  });
  if (!scan) return null;
  const [drift, monitor, withShot, prev] = await Promise.all([
    // drift detected by this scan and every earlier scan of the domain
    prisma.driftEvent.findMany({ where: { domain: scan.domain, scan: { createdAt: { lte: scan.createdAt } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.monitor.findUnique({ where: { domain: scan.domain } }),
    // whether an image is really stored (older scans have theirs pruned)
    prisma.asset.findMany({ where: { scanId: id, screenshot: { not: null } }, select: { id: true } }),
    scan.baselineScanId
      ? prisma.scan.findUnique({ where: { id: scan.baselineScanId }, select: { score: true, finishedAt: true, createdAt: true } })
      : null,
  ]);
  const stored = new Set(withShot.map((a) => a.id));
  const dto = toScanDTO({ ...scan, assets: scan.assets as unknown as Asset[] }, drift, monitor?.enabled ?? false);
  dto.assets = dto.assets.map((a) => ({ ...a, hasScreenshot: stored.has(a.id) }));
  if (prev) dto.baseline = { score: prev.score, date: (prev.finishedAt ?? prev.createdAt).toISOString() };
  return dto;
}

export function toScanDTO(scan: Scan & { assets: Asset[]; exposures?: Exposure[] }, drift: DriftEvent[] = [], monitored = false): ScanDTO {
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
    exposures: (scan.exposures ?? []).map(toExposureDTO).sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]),
    attackPaths: parse<AttackPath[]>(scan.attackPaths, []),
    emailSecurity: parse<EmailSecurity | null>(scan.emailSecurity, null),
    driftEvents: drift.map(toDriftDTO),
    baselineScanId: scan.baselineScanId,
    baseline: null,
    monitored,
  };
}

/** The 20 most recent scans for the scan picker. */
export async function listScans(): Promise<ScanListItem[]> {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, domain: true, status: true, score: true, createdAt: true, _count: { select: { assets: true } } },
  });
  return scans.map(({ _count, createdAt, ...s }) => ({ ...s, createdAt: createdAt.toISOString(), assetCount: _count.assets }));
}
