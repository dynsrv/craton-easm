import { inScope, isValidHostname } from './domain';

const UA = 'Craton-EASM/0.1 (+passive external exposure review)';

/** One passive OSINT source and the hostnames it returned. */
export interface OsintSourceResult {
  source: string;
  names: string[];
  ok: boolean;
}

/** Keep only valid, in-scope hostnames; strip wildcards and trailing dots. */
function clean(raw: Iterable<string>, domain: string): string[] {
  const out = new Set<string>();
  for (const r of raw) {
    const name = r.trim().toLowerCase().replace(/^\*\./, '').replace(/\.$/, '').replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    if (!name || name.includes('@') || !isValidHostname(name) || !inScope(name, domain)) continue;
    out.add(name);
  }
  return [...out];
}

async function getText(url: string, timeoutMs: number, headers: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null; // timeout, rate-limit or network error: this source just contributes nothing
  }
}

/**
 * SSLMate Cert Spotter — Certificate Transparency, no API key (free anonymous tier).
 * Often faster and broader than crt.sh, and a good second CT opinion.
 */
export async function fromCertSpotter(domain: string, timeoutMs = 12_000): Promise<OsintSourceResult> {
  const url = `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`;
  const text = await getText(url, timeoutMs);
  if (text == null) return { source: 'certspotter', names: [], ok: false };
  try {
    const rows = JSON.parse(text) as { dns_names?: string[] }[];
    const names = clean(rows.flatMap((r) => r.dns_names ?? []), domain);
    return { source: 'certspotter', names, ok: true };
  } catch {
    return { source: 'certspotter', names: [], ok: false };
  }
}

/**
 * HackerTarget hostsearch — passive DNS, no API key (free ~20-50 queries/day per IP).
 * Returns "hostname,ip" lines; we keep the hostnames.
 */
export async function fromHackerTarget(domain: string, timeoutMs = 10_000): Promise<OsintSourceResult> {
  const text = await getText(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`, timeoutMs);
  // The free quota message comes back as a 200 body, so treat it as "no data" rather than hostnames.
  if (text == null || /API count exceeded|error|no records/i.test(text)) return { source: 'hackertarget', names: [], ok: text != null };
  const names = clean(
    text.split('\n').map((line) => line.split(',')[0]),
    domain,
  );
  return { source: 'hackertarget', names, ok: true };
}

/**
 * Wayback Machine CDX — historical URLs the Internet Archive has seen, no API key.
 * Surfaces forgotten hosts that no longer hold a certificate.
 */
export async function fromWayback(domain: string, timeoutMs = 15_000): Promise<OsintSourceResult> {
  const url = `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(domain)}&output=json&fl=original&collapse=urlkey&limit=5000`;
  const text = await getText(url, timeoutMs);
  if (text == null) return { source: 'wayback', names: [], ok: false };
  try {
    const rows = JSON.parse(text) as string[][];
    // First row is the header ["original"]; each later row is a single URL.
    const names = clean(
      rows.slice(1).map((r) => r[0] ?? ''),
      domain,
    );
    return { source: 'wayback', names, ok: true };
  } catch {
    return { source: 'wayback', names: [], ok: false };
  }
}

/**
 * AlienVault OTX passive DNS — threat-intel passive DNS, free API key (optional).
 * Adds the most coverage of the optional sources when a key is set in /admin.
 */
export async function fromOtx(domain: string, key: string, timeoutMs = 12_000): Promise<OsintSourceResult> {
  const text = await getText(`https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(domain)}/passive_dns`, timeoutMs, { 'X-OTX-API-KEY': key });
  if (text == null) return { source: 'otx', names: [], ok: false };
  try {
    const data = JSON.parse(text) as { passive_dns?: { hostname?: string }[] };
    const names = clean((data.passive_dns ?? []).map((r) => r.hostname ?? ''), domain);
    return { source: 'otx', names, ok: true };
  } catch {
    return { source: 'otx', names: [], ok: false };
  }
}

/**
 * Query every configured passive source in parallel and merge the hostnames.
 * All sources are best-effort: a slow or rate-limited source contributes nothing and never fails the scan.
 */
export async function gatherOsintNames(domain: string, opts: { otxKey?: string | null } = {}): Promise<{ names: string[]; sources: OsintSourceResult[] }> {
  const jobs = [fromCertSpotter(domain), fromHackerTarget(domain), fromWayback(domain)];
  if (opts.otxKey) jobs.push(fromOtx(domain, opts.otxKey));
  const sources = await Promise.all(jobs);
  const names = new Set<string>();
  for (const s of sources) for (const n of s.names) names.add(n);
  return { names: [...names], sources };
}
