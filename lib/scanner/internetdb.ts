import { isPublicIPv4 } from './domain';

export interface IpIntel {
  ports: number[];
  cves: string[];
}

const EMPTY: IpIntel = { ports: [], cves: [] };

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
  return { ports: [...new Set(ports)].sort((a, b) => a - b), cves: [...new Set(vulns)].sort().reverse() };
}

export { SENSITIVE_PORTS } from '../ports';
