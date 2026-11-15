import pLimit from 'p-limit';
import { redact } from '../redact';
import type { EmailSecurity, ExposureFinding } from '../types';
import { Resolver } from 'node:dns/promises';

/**
 * MODULE 3. Public leak and cloud storage hygiene.
 *
 * Public code: GitHub code search (only with a GitHub token) for the company's domain and internal hostnames
 * in configuration files. Every fragment is redacted in memory before it is kept or sent to an LLM.
 *
 * Cloud buckets: one HTTP HEAD per name and provider. HEAD returns status only, so no listing and no object
 * is ever downloaded. 200 on the bucket root means anonymous listing is allowed.
 */

const UA = 'Craton-EASM/0.2 (+passive external exposure review)';

/* ---------------- public code ---------------- */

export interface CodeSearchItem {
  path: string;
  html_url: string;
  repository: { full_name: string; html_url: string; private?: boolean };
  text_matches?: { fragment?: string }[];
}

const SENSITIVE_FILES = ['.env', 'config.json', 'docker-compose.yml'];

export async function searchPublicCode(
  domain: string,
  internalHosts: string[],
  token: string | null,
  onLog: (m: string) => void = () => {},
): Promise<ExposureFinding[]> {
  if (!token) {
    onLog('  public code check skipped (no GitHub token configured)');
    return [];
  }
  const queries = [
    ...SENSITIVE_FILES.map((f) => `"${domain}" filename:${f}`),
    ...internalHosts.slice(0, 2).map((h) => `"${h}"`),
  ];
  const seen = new Map<string, ExposureFinding>();

  // GitHub allows about 10 code searches per minute: run them one at a time.
  for (const q of queries) {
    try {
      const res = await fetch(`https://api.github.com/search/code?per_page=10&q=${encodeURIComponent(q)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.text-match+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': UA,
        },
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      });
      if (res.status === 401 || res.status === 403) {
        onLog(`  GitHub search refused (${res.status}); check the token or try again later`);
        break;
      }
      if (!res.ok) continue;
      const data = (await res.json()) as { items?: CodeSearchItem[] };
      for (const item of data.items ?? []) {
        const key = `${item.repository.full_name}/${item.path}`;
        if (seen.has(key)) continue;
        const raw = (item.text_matches ?? []).map((m) => m.fragment ?? '').join('\n…\n').slice(0, 1200);
        const { text, found } = redact(raw); // redact BEFORE anything is kept
        seen.set(key, codeFinding(domain, item, text, found));
      }
    } catch {
      /* network error on one query: keep going */
    }
  }
  onLog(`  public code: ${seen.size} file(s) mention ${domain} or its internal hosts`);
  return [...seen.values()];
}

export function codeFinding(domain: string, item: CodeSearchItem, fragment: string, secretTypes: string[]): ExposureFinding {
  const hasSecret = secretTypes.length > 0;
  const where = `${item.repository.full_name}/${item.path}`;
  const kinds = secretTypes.join(', ');
  return {
    kind: 'code_leak',
    severity: hasSecret ? 'High' : 'Medium',
    hostname: null,
    provider: 'GitHub',
    target: item.html_url,
    evidence: fragment || '(no preview available)',
    title: {
      en: hasSecret ? `Possible credentials for ${domain} in public code` : `Internal ${domain} configuration in public code`,
      id: hasSecret ? `Kemungkinan kredensial ${domain} di kode publik` : `Konfigurasi internal ${domain} di kode publik`,
    },
    reasoning: hasSecret
      ? {
          en: `${where} references your domain and contains values that look like secrets (${kinds}). They were redacted here and never stored. Attackers search GitHub for exactly this.`,
          id: `${where} merujuk domain Anda dan berisi nilai yang tampak seperti secret (${kinds}). Nilai tersebut sudah disamarkan dan tidak pernah disimpan. Penyerang mencari hal persis seperti ini di GitHub.`,
        }
      : {
          en: `${where} references your domain or internal hostnames in a configuration file. It maps internal systems for an attacker even without credentials.`,
          id: `${where} merujuk domain atau hostname internal Anda di file konfigurasi. Tanpa kredensial pun, ini memetakan sistem internal bagi penyerang.`,
        },
    remediation: hasSecret
      ? {
          en: `Treat the secrets as compromised: rotate them today, then ask the repository owner (or GitHub support, for a third party) to remove the file and purge it from history. Enable secret scanning on your own organisation.`,
          id: `Anggap secret tersebut sudah bocor: rotasi hari ini, lalu minta pemilik repositori (atau GitHub support, jika pihak ketiga) menghapus file dan membersihkannya dari history. Aktifkan secret scanning di organisasi Anda.`,
        }
      : {
          en: `Check whether the repository belongs to your organisation or a vendor. Remove internal hostnames from public code and keep configuration in private repositories.`,
          id: `Periksa apakah repositori milik organisasi Anda atau vendor. Hapus hostname internal dari kode publik dan simpan konfigurasi di repositori privat.`,
        },
  };
}

/* ---------------- cloud buckets ---------------- */

export function orgLabel(domain: string): string {
  return domain.split('.')[0].replace(/[^a-z0-9-]/g, '');
}

export function bucketNames(domain: string): string[] {
  const org = orgLabel(domain);
  return [org, `${org}-public`, `${org}-assets`, `${org}-backup`, `${org}-dev`, `${org}-static`];
}

interface BucketProvider {
  name: string;
  url: (bucket: string) => string;
  /** The response really came from this provider (not a proxy, firewall or CDN error page). */
  genuine: (h: Headers) => boolean;
}

export const BUCKET_PROVIDERS: BucketProvider[] = [
  { name: 'AWS S3', url: (b) => `https://${b}.s3.amazonaws.com/`, genuine: (h) => h.has('x-amz-request-id') || /AmazonS3/i.test(h.get('server') ?? '') },
  { name: 'Google Cloud Storage', url: (b) => `https://storage.googleapis.com/${b}/`, genuine: (h) => h.has('x-guploader-uploadid') || /UploadServer/i.test(h.get('server') ?? '') },
  { name: 'Alibaba Cloud OSS (Jakarta)', url: (b) => `https://${b}.oss-ap-southeast-5.aliyuncs.com/`, genuine: (h) => h.has('x-oss-request-id') || /AliyunOSS/i.test(h.get('server') ?? '') },
];

type BucketState = 'listable' | 'exists' | 'absent' | 'unknown';

async function head(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { method: 'HEAD', redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000), cache: 'no-store' });
  } catch {
    return null;
  }
}

export async function probeBucket(provider: BucketProvider, bucket: string): Promise<{ state: BucketState; url: string; status: number | null }> {
  let url = provider.url(bucket);
  let res = await head(url);
  // S3 answers 301 with the real region when the bucket lives elsewhere: ask that region once.
  const region = res?.headers.get('x-amz-bucket-region');
  if (res && res.status >= 300 && res.status < 400 && region && /^[a-z0-9-]+$/.test(region)) {
    url = `https://${bucket}.s3.${region}.amazonaws.com/`;
    res = await head(url);
  }
  if (!res || !provider.genuine(res.headers)) return { state: 'unknown', url, status: res?.status ?? null };
  const s = res.status;
  const state: BucketState = s === 200 ? 'listable' : s === 403 || s === 401 || (s >= 300 && s < 400) ? 'exists' : s === 404 ? 'absent' : 'unknown';
  return { state, url, status: s };
}

export async function checkBuckets(domain: string, onLog: (m: string) => void = () => {}): Promise<ExposureFinding[]> {
  const limit = pLimit(4);
  const jobs = bucketNames(domain).flatMap((b) => BUCKET_PROVIDERS.map((p) => ({ b, p })));
  const results = await Promise.all(jobs.map(({ b, p }) => limit(async () => ({ b, p, r: await probeBucket(p, b) }))));
  const findings: ExposureFinding[] = [];
  for (const { b, p, r } of results) {
    if (r.state === 'listable') findings.push(bucketFinding(b, p.name, r.url, r.status!, true));
    else if (r.state === 'exists') findings.push(bucketFinding(b, p.name, r.url, r.status!, false));
  }
  onLog(`  cloud storage: ${jobs.length} names checked, ${findings.filter((f) => f.severity !== 'Info').length} publicly listable, ${findings.filter((f) => f.severity === 'Info').length} private`);
  return findings;
}

export function bucketFinding(bucket: string, provider: string, url: string, status: number, listable: boolean): ExposureFinding {
  const sensitive = /-(backup|dev)$/.test(bucket);
  return {
    kind: 'bucket',
    severity: listable ? (sensitive ? 'Critical' : 'High') : 'Info',
    hostname: null,
    provider,
    target: url,
    evidence: `HEAD ${url} → HTTP ${status}${listable ? ' (anonymous listing allowed)' : ' (exists, access denied)'}`,
    title: listable
      ? { en: `Publicly listable bucket "${bucket}" on ${provider}`, id: `Bucket "${bucket}" di ${provider} dapat dilihat publik` }
      : { en: `Bucket "${bucket}" exists on ${provider}`, id: `Bucket "${bucket}" ada di ${provider}` },
    reasoning: listable
      ? {
          en: `Anyone can list the contents of "${bucket}". Bucket names are global, so confirm it is yours first. If it is, every file name (and usually every file) is public${sensitive ? ', and the name suggests backups or development data' : ''}. Nothing was listed or downloaded by this check.`,
          id: `Siapa pun dapat melihat daftar isi "${bucket}". Nama bucket bersifat global, jadi pastikan dulu bucket ini milik Anda. Jika ya, semua nama file (dan biasanya semua file) bersifat publik${sensitive ? ', dan namanya mengindikasikan backup atau data development' : ''}. Pemeriksaan ini tidak melihat daftar atau mengunduh apa pun.`,
        }
      : {
          en: `A bucket with your organisation's name exists and refuses anonymous access, which is the safe setting. Confirm it belongs to you; if not, someone else holds a name customers may trust.`,
          id: `Bucket dengan nama organisasi Anda ada dan menolak akses anonim, yang merupakan pengaturan aman. Pastikan bucket ini milik Anda; jika bukan, pihak lain memegang nama yang mungkin dipercaya pelanggan.`,
        },
    remediation: listable
      ? {
          en: `Turn on "Block public access" (S3), remove allUsers / allAuthenticatedUsers (GCS), or set the bucket ACL to private (OSS). Serve public files through a CDN with a scoped policy instead of an open listing.`,
          id: `Aktifkan "Block public access" (S3), hapus allUsers / allAuthenticatedUsers (GCS), atau set ACL bucket menjadi private (OSS). Sajikan file publik lewat CDN dengan policy terbatas, bukan listing terbuka.`,
        }
      : { en: 'No action needed if the bucket is yours. Keep it in your asset inventory.', id: 'Tidak perlu tindakan jika bucket ini milik Anda. Catat dalam inventaris aset.' },
  };
}

/* ---------------- email security (SPF / DMARC) ---------------- */

const resolver = new Resolver({ timeout: 3000, tries: 2 });

/**
 * TXT records via DNS-over-HTTPS (Cloudflare, then Google), falling back to the system resolver.
 * Returns null when no source gave a definite answer, so a DNS outage is never reported as "no SPF".
 */
async function txt(name: string): Promise<string[] | null> {
  for (const url of [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`,
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`,
  ]) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(5000), cache: 'no-store' });
      if (!res.ok) continue;
      const body = (await res.json()) as { Status: number; Answer?: { type: number; data: string }[] };
      if (body.Status === 3) return []; // NXDOMAIN: definitely no record
      if (body.Status !== 0) continue;
      return (body.Answer ?? []).filter((a) => a.type === 16).map((a) => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''));
    } catch {
      /* try the next source */
    }
  }
  try {
    return (await resolver.resolveTxt(name)).map((parts) => parts.join(''));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    return code === 'ENOTFOUND' || code === 'ENODATA' ? [] : null;
  }
}

export async function checkEmailSecurity(domain: string): Promise<EmailSecurity | null> {
  const [root, dmarcTxt] = await Promise.all([txt(domain), txt(`_dmarc.${domain}`)]);
  if (root == null || dmarcTxt == null) return null; // unknown, not "missing"
  const spfRecord = root.find((r) => /^v=spf1\b/i.test(r)) ?? null;
  const dmarcRecord = dmarcTxt.find((r) => /^v=DMARC1\b/i.test(r)) ?? null;

  const all = spfRecord?.match(/([+?~-]?)all\b/i)?.[1];
  const spfPolicy: EmailSecurity['spf']['policy'] = !spfRecord
    ? 'none'
    : all === '-'
      ? 'fail'
      : all === '~'
        ? 'softfail'
        : all === '?'
          ? 'neutral'
          : all === '+' || all === ''
            ? 'pass-all'
            : 'neutral'; // no "all" mechanism: behaves like neutral

  const p = dmarcRecord?.match(/;\s*p=(\w+)/i)?.[1]?.toLowerCase();
  const dmarcPolicy: EmailSecurity['dmarc']['policy'] = !dmarcRecord ? 'none' : p === 'reject' ? 'reject' : p === 'quarantine' ? 'quarantine' : 'monitor';

  return { spf: { record: spfRecord, policy: spfPolicy }, dmarc: { record: dmarcRecord, policy: dmarcPolicy } };
}

/** Higher = stronger. Used for findings here and for drift. */
export const SPF_RANK = { none: 0, 'pass-all': 0, neutral: 1, softfail: 2, fail: 3 } as const;
export const DMARC_RANK = { none: 0, monitor: 1, quarantine: 2, reject: 3 } as const;

export function emailFindings(domain: string, e: EmailSecurity): ExposureFinding[] {
  const out: ExposureFinding[] = [];
  if (SPF_RANK[e.spf.policy] < 2) {
    out.push({
      kind: 'email',
      severity: e.spf.policy === 'pass-all' ? 'High' : 'Medium',
      hostname: domain,
      provider: 'DNS',
      target: `${domain} TXT (SPF)`,
      evidence: e.spf.record ?? 'No SPF record',
      title: { en: e.spf.record ? `Weak SPF policy on ${domain}` : `No SPF record on ${domain}`, id: e.spf.record ? `Kebijakan SPF lemah pada ${domain}` : `Tidak ada record SPF pada ${domain}` },
      reasoning: {
        en: 'Without a strict SPF policy, receiving mail servers cannot reject mail that pretends to come from your domain. This is the easiest way to phish your customers in your name.',
        id: 'Tanpa kebijakan SPF yang ketat, server penerima tidak dapat menolak email yang berpura-pura berasal dari domain Anda. Ini cara termudah memancing pelanggan Anda atas nama Anda.',
      },
      remediation: {
        en: 'Publish a TXT record listing your real senders and ending in "~all" (then "-all" once verified), e.g. v=spf1 include:_spf.google.com ~all.',
        id: 'Pasang record TXT yang mencantumkan pengirim resmi Anda dan diakhiri "~all" (lalu "-all" setelah terverifikasi), misalnya v=spf1 include:_spf.google.com ~all.',
      },
    });
  }
  if (DMARC_RANK[e.dmarc.policy] < 2) {
    out.push({
      kind: 'email',
      severity: e.dmarc.policy === 'none' ? 'Medium' : 'Low',
      hostname: domain,
      provider: 'DNS',
      target: `_dmarc.${domain} TXT`,
      evidence: e.dmarc.record ?? 'No DMARC record',
      title: {
        en: e.dmarc.record ? `DMARC is monitor-only (p=none) on ${domain}` : `No DMARC record on ${domain}`,
        id: e.dmarc.record ? `DMARC hanya memantau (p=none) pada ${domain}` : `Tidak ada record DMARC pada ${domain}`,
      },
      reasoning: {
        en: 'DMARC tells mail providers what to do with mail that fails SPF and DKIM. Without p=quarantine or p=reject, spoofed mail still reaches inboxes.',
        id: 'DMARC memberi tahu penyedia email apa yang dilakukan pada email yang gagal SPF dan DKIM. Tanpa p=quarantine atau p=reject, email palsu tetap sampai ke inbox.',
      },
      remediation: {
        en: 'Publish v=DMARC1; p=none; rua=mailto:dmarc@yourdomain to collect reports for 2-4 weeks, fix legitimate senders, then move to p=quarantine and p=reject.',
        id: 'Pasang v=DMARC1; p=none; rua=mailto:dmarc@domainanda untuk mengumpulkan laporan selama 2-4 minggu, perbaiki pengirim resmi, lalu naikkan ke p=quarantine dan p=reject.',
      },
    });
  }
  return out;
}
