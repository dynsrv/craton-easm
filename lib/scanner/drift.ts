import { lookup } from 'node:dns/promises';
import { prisma } from '../db';
import { SENSITIVE_PORTS } from '../ports';
import type { Bilingual, EmailSecurity, ExposureFinding, Severity } from '../types';
import { isPublicIPv4 } from './domain';
import { DMARC_RANK, SPF_RANK } from './exposure-leaks';

/**
 * MODULE 5. Attack surface drift.
 *
 * Every completed scan stores a compact snapshot. The next scan of the same root domain is compared
 * against it, and each meaningful change becomes a DriftEvent. High and Critical events are posted
 * as JSON to ALERT_WEBHOOK_URL when one is configured.
 */

export interface SnapshotHost {
  ports: number[];
  tlsDaysLeft: number | null;
  severity: Severity | null;
}

export interface SnapshotData {
  version: 1;
  takenAt: string;
  hosts: Record<string, SnapshotHost>;
  email: EmailSecurity | null;
  takeovers: string[];
  publicBuckets: string[];
  codeLeaks: string[];
}

export interface DriftChange {
  kind:
    | 'new_host'
    | 'removed_host'
    | 'new_port'
    | 'cert_expired'
    | 'cert_expiring'
    | 'spf_weakened'
    | 'dmarc_weakened'
    | 'new_takeover'
    | 'new_public_bucket'
    | 'new_code_leak';
  severity: Severity;
  hostname: string | null;
  detail: Bilingual;
}

export function buildSnapshot(
  assets: { hostname: string; ports: number[]; tlsDaysLeft: number | null; severity: Severity | null }[],
  email: EmailSecurity | null,
  exposures: ExposureFinding[],
): SnapshotData {
  return {
    version: 1,
    takenAt: new Date().toISOString(),
    hosts: Object.fromEntries(assets.map((a) => [a.hostname, { ports: [...a.ports].sort((x, y) => x - y), tlsDaysLeft: a.tlsDaysLeft, severity: a.severity }])),
    email,
    takeovers: exposures.filter((e) => e.kind === 'takeover' && e.hostname).map((e) => e.hostname!),
    publicBuckets: exposures.filter((e) => e.kind === 'bucket' && e.severity !== 'Info').map((e) => e.target),
    codeLeaks: exposures.filter((e) => e.kind === 'code_leak').map((e) => e.target),
  };
}

const EXPIRING_DAYS = 14;

/** Pure comparison, unit-testable. */
export function diffSnapshots(prev: SnapshotData, next: SnapshotData): DriftChange[] {
  const out: DriftChange[] = [];

  for (const [host, h] of Object.entries(next.hosts)) {
    const before = prev.hosts[host];
    if (!before) {
      const sev: Severity = h.severity === 'Critical' || h.severity === 'High' ? 'High' : 'Medium';
      out.push({ kind: 'new_host', severity: sev, hostname: host, detail: { en: `New internet-facing host ${host}${h.ports.length ? ` (ports ${h.ports.join(', ')})` : ''}`, id: `Host baru yang menghadap internet: ${host}${h.ports.length ? ` (port ${h.ports.join(', ')})` : ''}` } });
    } else {
      const added = h.ports.filter((p) => !before.ports.includes(p));
      if (added.length) {
        const risky = added.filter((p) => SENSITIVE_PORTS[p] && SENSITIVE_PORTS[p].tier !== 'note');
        out.push({
          kind: 'new_port',
          severity: risky.some((p) => SENSITIVE_PORTS[p].tier === 'data') ? 'Critical' : risky.length ? 'High' : 'Low',
          hostname: host,
          detail: { en: `Newly open port${added.length > 1 ? 's' : ''} on ${host}: ${added.map((p) => (SENSITIVE_PORTS[p] ? `${p} (${SENSITIVE_PORTS[p].service})` : p)).join(', ')}`, id: `Port baru terbuka di ${host}: ${added.map((p) => (SENSITIVE_PORTS[p] ? `${p} (${SENSITIVE_PORTS[p].service})` : p)).join(', ')}` },
        });
      }
    }
    // certificates: report the transition, not every scan while it stays expired
    const was = before?.tlsDaysLeft ?? null;
    const now = h.tlsDaysLeft;
    if (now != null && now < 0 && (was == null || was >= 0) && before) {
      out.push({ kind: 'cert_expired', severity: 'High', hostname: host, detail: { en: `TLS certificate on ${host} has expired`, id: `Sertifikat TLS di ${host} sudah kedaluwarsa` } });
    } else if (now != null && now >= 0 && now < EXPIRING_DAYS && (was == null || was >= EXPIRING_DAYS)) {
      out.push({ kind: 'cert_expiring', severity: 'Medium', hostname: host, detail: { en: `TLS certificate on ${host} expires in ${now} day${now === 1 ? '' : 's'}`, id: `Sertifikat TLS di ${host} kedaluwarsa dalam ${now} hari` } });
    }
  }
  for (const host of Object.keys(prev.hosts)) {
    if (!next.hosts[host]) out.push({ kind: 'removed_host', severity: 'Info', hostname: host, detail: { en: `${host} is no longer reachable`, id: `${host} tidak lagi dapat diakses` } });
  }

  if (prev.email && next.email) {
    if (SPF_RANK[next.email.spf.policy] < SPF_RANK[prev.email.spf.policy]) {
      out.push({ kind: 'spf_weakened', severity: 'High', hostname: null, detail: { en: `SPF weakened from "${prev.email.spf.policy}" to "${next.email.spf.policy}"`, id: `SPF melemah dari "${prev.email.spf.policy}" menjadi "${next.email.spf.policy}"` } });
    }
    if (DMARC_RANK[next.email.dmarc.policy] < DMARC_RANK[prev.email.dmarc.policy]) {
      out.push({ kind: 'dmarc_weakened', severity: 'High', hostname: null, detail: { en: `DMARC weakened from "${prev.email.dmarc.policy}" to "${next.email.dmarc.policy}"`, id: `DMARC melemah dari "${prev.email.dmarc.policy}" menjadi "${next.email.dmarc.policy}"` } });
    }
  }

  for (const h of next.takeovers.filter((x) => !prev.takeovers.includes(x))) {
    out.push({ kind: 'new_takeover', severity: 'Critical', hostname: h, detail: { en: `New dangling DNS record: ${h}`, id: `Record DNS menggantung baru: ${h}` } });
  }
  for (const b of next.publicBuckets.filter((x) => !prev.publicBuckets.includes(x))) {
    out.push({ kind: 'new_public_bucket', severity: 'High', hostname: null, detail: { en: `Bucket became publicly listable: ${b}`, id: `Bucket menjadi dapat dilihat publik: ${b}` } });
  }
  for (const c of next.codeLeaks.filter((x) => !prev.codeLeaks.includes(x))) {
    out.push({ kind: 'new_code_leak', severity: 'High', hostname: null, detail: { en: `New public code reference: ${c}`, id: `Referensi kode publik baru: ${c}` } });
  }
  return out;
}

/** Saves this scan's snapshot, compares it with the previous one for the domain and records drift events. */
export async function recordDrift(scanId: string, domain: string, snapshot: SnapshotData): Promise<{ baselineScanId: string | null; changes: DriftChange[] }> {
  const previous = await prisma.scanSnapshot.findFirst({ where: { domain, scanId: { not: scanId } }, orderBy: { createdAt: 'desc' } });
  await prisma.scanSnapshot.upsert({ where: { scanId }, create: { scanId, domain, data: JSON.stringify(snapshot) }, update: { data: JSON.stringify(snapshot) } });
  if (!previous) return { baselineScanId: null, changes: [] };

  const changes = diffSnapshots(JSON.parse(previous.data) as SnapshotData, snapshot);
  if (changes.length) {
    await prisma.driftEvent.createMany({
      data: changes.map((c) => ({ domain, scanId, baselineScanId: previous.scanId, kind: c.kind, severity: c.severity, hostname: c.hostname, detailEn: c.detail.en, detailId: c.detail.id })),
    });
  }
  return { baselineScanId: previous.scanId, changes };
}

/* ---------------- alerting ---------------- */

/** Admin-configured URL, but still: HTTPS only, and never an address on our own network. */
async function safeWebhook(url: string): Promise<URL | null> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  try {
    const addrs = await lookup(u.hostname, { all: true, family: 4 });
    if (!addrs.length || !addrs.every((a) => isPublicIPv4(a.address))) return null;
  } catch {
    return null;
  }
  return u;
}

export async function sendDriftAlert(webhookUrl: string | null, domain: string, scanId: string, appUrl: string | null): Promise<'sent' | 'skipped' | 'failed'> {
  if (!webhookUrl) return 'skipped';
  const events = await prisma.driftEvent.findMany({ where: { scanId, severity: { in: ['Critical', 'High'] }, notifiedAt: null } });
  if (!events.length) return 'skipped';
  const target = await safeWebhook(webhookUrl);
  if (!target) return 'failed';

  const payload = {
    source: 'craton-easm',
    type: 'attack_surface.drift',
    domain,
    scanId,
    url: appUrl ? `${appUrl.replace(/\/$/, '')}/?scan=${scanId}#drift` : undefined,
    detectedAt: new Date().toISOString(),
    // "text" makes the payload readable as-is by Slack and Microsoft Teams incoming webhooks
    text: `Craton: ${events.length} high-severity change${events.length > 1 ? 's' : ''} on ${domain}\n${events.map((e) => `• [${e.severity}] ${e.detailEn}`).join('\n')}`,
    events: events.map((e) => ({ kind: e.kind, severity: e.severity, hostname: e.hostname, detail: e.detailEn, detailId: e.detailId })),
  };
  try {
    const res = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Craton-EASM/0.2' }, body: JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return 'failed';
    await prisma.driftEvent.updateMany({ where: { id: { in: events.map((e) => e.id) } }, data: { notifiedAt: new Date() } });
    return 'sent';
  } catch {
    return 'failed';
  }
}
