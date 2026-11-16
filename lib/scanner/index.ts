import pLimit from 'p-limit';
import type { DiscoveredAsset } from '../types';
import { fetchCtSubdomains } from './crtsh';
import { bruteCommonPrefixes, COMMON_PREFIXES, isSharedEdge, prioritize, resolveAll, type DnsRecord } from './dns';
import { probeHost } from './http-probe';
import { cveRank, getCveDetails } from '../cve';
import { lookupIp, type IpIntel } from './internetdb';
import { trustedPorts } from '../ports';
import { findCnameOnlyRecords, type DanglingCandidate } from './takeover';
import { gatherOsintNames, type OsintSourceResult } from './osint';

export const PROBE_CONCURRENCY = 12;
export const PROBE_TIMEOUT_MS = 5000;

export interface DiscoveryProgress {
  phase: 0 | 1 | 2 | 3;
  message: string;
}

export interface DiscoveryResult {
  source: 'crt.sh' | 'dns-fallback';
  namesFound: number;
  assets: DiscoveredAsset[];
  /** Live DNS records of the probed hosts (for takeover checks). */
  records: DnsRecord[];
  /** Names with a CNAME but no address: candidates for dangling DNS. */
  cnameOnly: DanglingCandidate[];
  /** Which passive OSINT sources answered, and how many names each contributed. */
  osintSources: OsintSourceResult[];
}

/**
 * PHASE A. Deterministic, outside-in discovery for one root domain.
 * Everything here is either a third-party lookup (crt.sh, DNS, Shodan) or a single GET to "/".
 */
export async function discover(
  domain: string,
  onProgress: (p: DiscoveryProgress) => void | Promise<void> = () => {},
  options: { shodanKey?: string | null; otxKey?: string | null; maxHosts?: number } = {},
): Promise<DiscoveryResult> {
  // 1. Certificate Transparency, with DNS fallback
  let source: DiscoveryResult['source'] = 'crt.sh';
  let names: string[] = [];
  let live: DnsRecord[];

  await onProgress({ phase: 0, message: `Querying crt.sh, Cert Spotter, HackerTarget, Anubis${options.otxKey ? ', OTX' : ''} and the Wayback archive` });
  // Certificate Transparency (crt.sh) and the other passive sources run in parallel.
  const [ct, osint] = await Promise.all([
    fetchCtSubdomains(domain).catch((err: Error) => err),
    gatherOsintNames(domain, { otxKey: options.otxKey }),
  ]);

  const merged = new Set<string>([domain]);
  if (ct instanceof Error) {
    await onProgress({ phase: 0, message: `  crt.sh unavailable (${ct.message})` });
  } else {
    for (const n of ct) merged.add(n);
    await onProgress({ phase: 0, message: `  crt.sh: ${ct.length} names in certificate logs` });
  }
  for (const srcResult of osint.sources) {
    for (const n of srcResult.names) merged.add(n);
    if (srcResult.ok) await onProgress({ phase: 0, message: `  ${srcResult.source}: ${srcResult.names.length} names` });
  }

  const osintSources = osint.sources;
  names = [...merged].sort();
  // Fall back to prefix brute force only if every passive source came up empty.
  if (names.length <= 1) source = 'dns-fallback';
  await onProgress({ phase: 0, message: `  ${names.length} unique names after merging sources` });

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

  const liveNames = new Set(live.map((r) => r.hostname));
  const deadNames = (source === 'crt.sh' ? names : COMMON_PREFIXES.map((p) => `${p}.${domain}`)).filter((n) => !liveNames.has(n));
  const cnameOnly = await findCnameOnlyRecords(deadNames);
  if (cnameOnly.length) await onProgress({ phase: 1, message: `  ${cnameOnly.length} name(s) with a CNAME but no address (checked for dangling DNS)` });

  const maxHosts = options.maxHosts ?? 200;
  const targets = prioritize(live, maxHosts);
  if (live.length > maxHosts) await onProgress({ phase: 1, message: `  capped at the ${maxHosts} most interesting hosts (of ${live.length} live)` });

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
    const raw = info?.ports ?? [];
    return { ...t, http: probes[i], ports: trustedPorts(raw), portsRaw: raw, cves: info?.cves ?? [], cpes: info?.cpes ?? [] };
  });
  const withCves = assets.filter((a) => a.cves.length).length;

  // Rank each host's CVEs by real-world urgency so triage and the UI lead with what matters.
  if (withCves) {
    const details = await getCveDetails(assets.flatMap((a) => a.cves));
    for (const a of assets) {
      a.cves.sort((x, y) => cveRank(details.get(x), details.get(y)));
      a.cveFacts = a.cves.slice(0, 8).map((id) => ({ id, cvss: details.get(id)?.cvss ?? null, kev: details.get(id)?.kev ?? false }));
    }
    const kev = new Set(assets.flatMap((a) => a.cveFacts ?? []).filter((f) => f.kev).map((f) => f.id));
    await onProgress({ phase: 3, message: `  CVE details for ${details.size} IDs${kev.size ? `, ${kev.size} actively exploited (CISA KEV)` : ''}` });
  }
  await onProgress({ phase: 3, message: `  ${assets.filter((a) => a.ports.length).length} hosts with port data, ${withCves} with known CVEs` });

  return { source, namesFound: names.length, assets, records: targets, cnameOnly, osintSources };
}
