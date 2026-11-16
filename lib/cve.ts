import pLimit from 'p-limit';

/** What a published vulnerability means, from Shodan's CVEDB (NVD + CISA KEV + FIRST EPSS). */
export interface CveDetail {
  id: string;
  /** CVSS base score (v3 preferred), 0–10. */
  cvss: number | null;
  /** On CISA's Known Exploited Vulnerabilities list: attackers use it in the wild. */
  kev: boolean;
  /** Used in known ransomware campaigns (from KEV). */
  ransomware: boolean;
  /** FIRST EPSS: probability of exploitation in the next 30 days, 0–1. */
  epss: number | null;
  summary: string;
  /** CISA's required action, when the CVE is on KEV. */
  action: string | null;
  published: string | null;
  /** vendor:product pairs the CVE applies to, e.g. "apache:http_server". */
  products: string[];
}

export const CVE_ID = /^CVE-\d{4}-\d{4,7}$/;

// Survives between requests on a warm function; CVE records change rarely.
const cache = new Map<string, { at: number; value: CveDetail | null }>();
const TTL_MS = 24 * 60 * 60 * 1000;

async function fetchOne(id: string, timeoutMs: number): Promise<CveDetail | null> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  let value: CveDetail | null = null;
  try {
    const res = await fetch(`https://cvedb.shodan.io/cve/${id}`, {
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const d = (await res.json()) as Record<string, unknown>;
      const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
      const cpes = Array.isArray(d.cpes) ? (d.cpes as unknown[]).filter((c): c is string => typeof c === 'string') : [];
      value = {
        id,
        cvss: num(d.cvss_v3) ?? num(d.cvss) ?? num(d.cvss_v4) ?? num(d.cvss_v2),
        kev: d.kev === true,
        ransomware: typeof d.ransomware_campaign === 'string' && d.ransomware_campaign.toLowerCase() === 'known',
        epss: num(d.epss),
        summary: typeof d.summary === 'string' ? d.summary.trim() : '',
        action: typeof d.propose_action === 'string' && d.propose_action.trim() ? d.propose_action.trim() : null,
        published: typeof d.published_time === 'string' ? d.published_time.slice(0, 10) : null,
        products: [...new Set(cpes.map(vendorProduct).filter((x): x is string => !!x))],
      };
    }
  } catch {
    value = null; // network or timeout: the UI falls back to the bare ID
  }
  cache.set(id, { at: Date.now(), value });
  return value;
}

/** Look up many CVEs with bounded concurrency. Missing or failed lookups are left out. */
export async function getCveDetails(ids: string[], { max = 120, timeoutMs = 6000 } = {}): Promise<Map<string, CveDetail>> {
  const unique = [...new Set(ids.filter((id) => CVE_ID.test(id)))].slice(0, max);
  const limit = pLimit(6);
  const out = new Map<string, CveDetail>();
  await Promise.all(
    unique.map((id) =>
      limit(async () => {
        const d = await fetchOne(id, timeoutMs);
        if (d) out.set(id, d);
      }),
    ),
  );
  return out;
}

/** Most urgent first: actively exploited, then CVSS, then exploit probability. */
export function cveRank(a: CveDetail | undefined, b: CveDetail | undefined): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return Number(b.kev) - Number(a.kev) || (b.cvss ?? 0) - (a.cvss ?? 0) || (b.epss ?? 0) - (a.epss ?? 0);
}

/** "cpe:/a:apache:http_server:2.4.49" or "cpe:2.3:a:apache:http_server:2.4.49" -> "apache:http_server". */
export function vendorProduct(cpe: string): string | null {
  const parts = cpe.replace(/^cpe:2\.3:/, 'cpe:/').replace(/^cpe:\//, '').split(':');
  return parts.length >= 3 ? `${parts[1]}:${parts[2]}`.toLowerCase() : null;
}

/** Human label for a CPE: "Apache Http Server 2.4.49". */
export function cpeLabel(cpe: string): string {
  const parts = cpe.replace(/^cpe:2\.3:/, 'cpe:/').replace(/^cpe:\//, '').split(':');
  const [, vendor = '', product = '', version = ''] = parts;
  const NAMES: Record<string, string> = {
    fortios: 'FortiOS', fortinet: 'Fortinet', openssh: 'OpenSSH', openbsd: 'OpenBSD', openssl: 'OpenSSL', mysql: 'MySQL',
    postgresql: 'PostgreSQL', mariadb: 'MariaDB', wordpress: 'WordPress', jquery: 'jQuery', nginx: 'nginx', phpmyadmin: 'phpMyAdmin',
    mongodb: 'MongoDB', elasticsearch: 'Elasticsearch', redis: 'Redis', vmware: 'VMware', citrix: 'Citrix', paloaltonetworks: 'Palo Alto Networks',
    pan_os: 'PAN-OS', 'pan-os': 'PAN-OS', exim: 'Exim', proftpd: 'ProFTPD', vsftpd: 'vsftpd', openresty: 'OpenResty', tomcat: 'Tomcat',
  };
  const UPPER = new Set(['http', 'https', 'ssl', 'tls', 'ssh', 'vpn', 'api', 'iis', 'sql', 'php', 'dns', 'ftp', 'smtp', 'imap', 'ldap', 'os', 'rdp', 'jdk', 'cms', 'erp', 'crm']);
  const words = (s: string) =>
    s
      .split(/[_-]+/)
      .filter(Boolean)
      .map((w) => NAMES[w.toLowerCase()] ?? (UPPER.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  const name = product.toLowerCase().startsWith(vendor.toLowerCase()) ? words(product) : `${words(vendor)} ${words(product)}`;
  return [name.trim(), version && version !== '*' && version !== '-' ? version : ''].filter(Boolean).join(' ');
}
