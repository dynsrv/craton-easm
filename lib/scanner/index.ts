import pLimit from 'p-limit';
import type { DiscoveredAsset } from '../types';
import { fetchCtSubdomains } from './crtsh';
import { bruteCommonPrefixes, isSharedEdge, prioritize, resolveAll, type DnsRecord } from './dns';
import { probeHost } from './http-probe';
import { lookupIp, type IpIntel } from './internetdb';

export const MAX_HOSTS = 50;
export const PROBE_CONCURRENCY = 8;
export const PROBE_TIMEOUT_MS = 5000;

export interface DiscoveryProgress {
  phase: 0 | 1 | 2 | 3;
  message: string;
}

export interface DiscoveryResult {
  source: 'crt.sh' | 'dns-fallback';
  namesFound: number;
  assets: DiscoveredAsset[];
}

/**
 * PHASE A. Deterministic, outside-in discovery for one root domain.
 * Everything here is either a third-party lookup (crt.sh, DNS, Shodan) or a single GET to "/".
 */
export async function discover(
  domain: string,
  onProgress: (p: DiscoveryProgress) => void | Promise<void> = () => {},
  options: { shodanKey?: string | null } = {},
): Promise<DiscoveryResult> {
  // 1. Certificate Transparency, with DNS fallback
  let source: DiscoveryResult['source'] = 'crt.sh';
  let names: string[] = [];
  let live: DnsRecord[];

  await onProgress({ phase: 0, message: `GET crt.sh/?q=%.${domain}&output=json` });
  try {
    names = await fetchCtSubdomains(domain);
    if (!names.includes(domain)) names.unshift(domain);
    await onProgress({ phase: 0, message: `  ${names.length} unique names in certificate logs` });
  } catch (err) {
    source = 'dns-fallback';
    await onProgress({ phase: 0, message: `  crt.sh unavailable (${(err as Error).message}); falling back to common prefixes` });
  }

  // 2. DNS resolution
  if (source === 'crt.sh' && names.length > 1) {
    await onProgress({ phase: 1, message: `Resolving ${names.length} names (concurrency ${PROBE_CONCURRENCY})` });
    live = await resolveAll(names, PROBE_CONCURRENCY);
  } else {
    source = 'dns-fallback';
    await onProgress({ phase: 1, message: 'Checking common enterprise prefixes via DNS' });
    live = await bruteCommonPrefixes(domain);
    names = live.map((r) => r.hostname);
  }
  await onProgress({ phase: 1, message: `  ${live.length} live, ${Math.max(0, names.length - live.length)} dead records filtered out` });

  const targets = prioritize(live, MAX_HOSTS);
  if (live.length > MAX_HOSTS) await onProgress({ phase: 1, message: `  capped at the ${MAX_HOSTS} most interesting hosts` });

  // 3. HTTP / TLS probing
  await onProgress({ phase: 2, message: `Probing ${targets.length} hosts (GET /, ${PROBE_TIMEOUT_MS / 1000}s timeout)` });
  const limit = pLimit(PROBE_CONCURRENCY);
  const probes = await Promise.all(
    targets.map((t) =>
      limit(async () => {
        const http = await probeHost(t.hostname, t.ips[0], domain, PROBE_TIMEOUT_MS);
        await onProgress({ phase: 2, message: `  ${String(http?.status ?? '---').padEnd(3)} ${t.hostname}` });
        return http;
      }),
    ),
  );

  // 4. Port / CVE enrichment, one lookup per unique IP
  const uniqueIps = [...new Set(targets.map((t) => t.ips[0]).filter(Boolean))];
  await onProgress({ phase: 3, message: `Shodan InternetDB lookup for ${uniqueIps.length} IPs` });
  const intel = new Map<string, IpIntel>();
  const intelLimit = pLimit(4);
  await Promise.all(uniqueIps.map((ip) => intelLimit(async () => void intel.set(ip, await lookupIp(ip, options.shodanKey ?? null)))));

  const assets: DiscoveredAsset[] = targets.map((t, i) => {
    // Ports on a shared CDN edge describe the CDN, not this customer.
    const info = isSharedEdge(t.provider) ? undefined : intel.get(t.ips[0]);
    return { ...t, http: probes[i], ports: info?.ports ?? [], cves: info?.cves ?? [] };
  });
  const withCves = assets.filter((a) => a.cves.length).length;
  await onProgress({ phase: 3, message: `  ${assets.filter((a) => a.ports.length).length} hosts with port data, ${withCves} with known CVEs` });

  return { source, namesFound: names.length, assets };
}
