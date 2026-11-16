import { isPublicIPv4 } from './domain';

export interface IpIntel {
  ports: number[];
  cves: string[];
  /** Software and versions seen in Shodan's crawl; CVEs are matched to these. */
  cpes: string[];
}

const EMPTY: IpIntel = { ports: [], cves: [], cpes: [] };

/**
 * Port and CVE enrichment from Shodan's own crawl data. We never touch the target's ports ourselves.
 * - With a Shodan API key (set in /admin or SHODAN_API_KEY): the full host API.
 * - Without: the free InternetDB (https://internetdb.shodan.io/{ip}), no key, updated weekly.
 */
export async function lookupIp(ip: string, key: string | null = null, timeoutMs = 8000): Promise<IpIntel> {
  if (!isPublicIPv4(ip)) return EMPTY;
  if (key) {
    const viaApi = await fetchJson(`https://api.shodan.io/shodan/host/${ip}?key=${encodeURIComponent(key)}&minify=true`, timeoutMs);
    if (viaApi) return normalize(viaApi);
  }
  const viaDb = await fetchJson(`https://internetdb.shodan.io/${ip}`, timeoutMs);
  return viaDb ? normalize(viaDb) : EMPTY;
}

async function fetchJson(url: string, timeoutMs: number): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    if (!res.ok) return null; // 404 = Shodan has nothing on this IP
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalize(data: Record<string, unknown>): IpIntel {
  const ports = Array.isArray(data.ports) ? data.ports.filter((p): p is number => typeof p === 'number') : [];
  const vulns = Array.isArray(data.vulns) ? data.vulns.filter((v): v is string => typeof v === 'string') : [];
  // InternetDB lists CPEs at the top level; the host API lists them per service banner.
  const cpes = new Set<string>();
  const addCpes = (v: unknown) => Array.isArray(v) && v.forEach((c) => typeof c === 'string' && cpes.add(c));
  addCpes(data.cpes);
  if (Array.isArray(data.data)) for (const b of data.data as Record<string, unknown>[]) (addCpes(b?.cpe23), addCpes(b?.cpe));
  // Host API vulns can be an object keyed by CVE ID.
  const vulnIds = vulns.length ? vulns : data.vulns && typeof data.vulns === 'object' ? Object.keys(data.vulns as object) : [];
  return {
    ports: [...new Set(ports)].sort((a, b) => a - b),
    cves: [...new Set(vulnIds)].filter((v) => /^CVE-/i.test(v)).sort().reverse(),
    cpes: [...cpes].slice(0, 20),
  };
}

export { SENSITIVE_PORTS } from '../ports';
