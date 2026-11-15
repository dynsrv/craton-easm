import { Resolver } from 'node:dns/promises';
import { randomBytes } from 'node:crypto';
import pLimit from 'p-limit';
import { inCidr, isPublicIPv4 } from './domain';

const resolver = new Resolver({ timeout: 3000, tries: 2 });

/** Used when crt.sh is unavailable. These are plain DNS lookups, not requests to the target's servers. */
export const COMMON_PREFIXES = [
  'www', 'api', 'dev', 'staging', 'uat', 'portal', 'admin', 'vpn', 'mail', 'sso',
  'erp', 'hris', 'app', 'mobile', 'cms', 'sandbox',
];

export interface DnsRecord {
  hostname: string;
  ips: string[];
  cname: string | null;
  provider: string;
}

async function tryResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function resolveHost(hostname: string): Promise<DnsRecord | null> {
  const [a, cnames] = await Promise.all([
    tryResolve(() => resolver.resolve4(hostname)),
    tryResolve(() => resolver.resolveCname(hostname)),
  ]);
  if (!a || a.length === 0) return null; // dead record
  const ips = a.filter(isPublicIPv4);
  const cname = cnames?.[0]?.toLowerCase() ?? null;
  const ptr = ips[0] ? await tryResolve(() => resolver.reverse(ips[0])) : null;
  return {
    hostname,
    ips: ips.length ? ips : a, // keep private IPs for the record; the prober skips them
    cname,
    provider: fingerprintProvider(ips[0] ?? a[0], cname, ptr?.[0]?.toLowerCase() ?? null),
  };
}

/** Resolve many names, drop the dead ones. */
export async function resolveAll(hostnames: string[], concurrency = 8): Promise<DnsRecord[]> {
  const limit = pLimit(concurrency);
  const results = await Promise.all(hostnames.map((h) => limit(() => resolveHost(h))));
  return results.filter((r): r is DnsRecord => r !== null);
}

/**
 * Fallback discovery. Detects wildcard DNS first: if a random label resolves,
 * every prefix would "exist", so only hosts on a different IP than the wildcard are kept.
 */
export async function bruteCommonPrefixes(domain: string): Promise<DnsRecord[]> {
  const canary = await tryResolve(() => resolver.resolve4(`${randomBytes(8).toString('hex')}.${domain}`));
  const wildcardIps = new Set(canary ?? []);
  const records = await resolveAll([domain, ...COMMON_PREFIXES.map((p) => `${p}.${domain}`)]);
  return records.filter(
    (r) => r.hostname === domain || r.hostname === `www.${domain}` || !r.ips.every((ip) => wildcardIps.has(ip)),
  );
}

/* ---------- hosting / cloud fingerprinting ---------- */

const CNAME_RULES: [RegExp, string][] = [
  [/\.cloudfront\.net$/, 'AWS CloudFront'],
  [/\.(amazonaws\.com|awsglobalaccelerator\.com|elasticbeanstalk\.com)$/, 'AWS'],
  [/\.(azurewebsites\.net|cloudapp\.azure\.com|trafficmanager\.net|azureedge\.net|azurefd\.net|windows\.net)$/, 'Microsoft Azure'],
  [/\.(outlook\.com|office\.com|office365\.com|lync\.com)$/, 'Microsoft 365'],
  [/(^|\.)ghs\.googlehosted\.com$|\.google\.com$/, 'Google Workspace'],
  [/\.(googleusercontent\.com|run\.app|appspot\.com|web\.app|firebaseapp\.com)$/, 'Google Cloud'],
  [/\.(aliyuncs\.com|alibabacloud\.com|alicdn\.com|aliyun\.com|alikunlun\.com)$/, 'Alibaba Cloud'],
  [/\.(cdn\.cloudflare\.net|cloudflare\.com|pages\.dev|workers\.dev)$/, 'Cloudflare'],
  [/\.(akamaiedge\.net|akamai\.net|edgekey\.net|edgesuite\.net)$/, 'Akamai'],
  [/\.(fastly\.net|fastlylb\.net)$/, 'Fastly'],
  [/\.(vercel-dns\.com|vercel\.app)$/, 'Vercel'],
  [/\.netlify\.(app|com)$/, 'Netlify'],
  [/\.herokuapp\.com$|\.herokudns\.com$/, 'Heroku'],
  [/\.github\.io$/, 'GitHub Pages'],
  [/\.(tencentcloudapi\.com|myqcloud\.com|tencent-cloud\.net)$/, 'Tencent Cloud'],
  [/\.(myhuaweicloud\.com|huaweicloud\.com)$/, 'Huawei Cloud'],
  [/\.(zendesk\.com|freshdesk\.com|hubspot\.net|wpengine\.com|shopify\.com|myshopify\.com)$/, 'SaaS (third party)'],
];

const PTR_RULES: [RegExp, string][] = [
  [/\.compute(-\d)?\.amazonaws\.com$|\.amazonaws\.com$/, 'AWS'],
  [/\.googleusercontent\.com$|\.1e100\.net$/, 'Google Cloud'],
  [/\.cloudapp\.azure\.com$/, 'Microsoft Azure'],
  [/biznet|\.gio\./, 'Biznet Gio (ID)'],
  [/idcloudhost|\.jkt\.idch/, 'IDCloudHost (ID)'],
  [/niagahoster|hostinger/, 'Niagahoster / Hostinger (ID)'],
  [/dewaweb/, 'Dewaweb (ID)'],
  [/rumahweb/, 'Rumahweb (ID)'],
  [/jagoanhosting|\.beon\./, 'Jagoan Hosting (ID)'],
  [/qwords/, 'Qwords (ID)'],
  [/telkom\.net\.id|\.telkom\.co\.id|neucentrix|astinet/, 'Telkom Indonesia (ID)'],
  [/indosat|\.lintasarta\./, 'Indosat / Lintasarta (ID)'],
  [/\.cbn\.net\.id/, 'CBN (ID)'],
  [/moratel|\.linknet\.|\.fast\.net\.id|\.biz\.net\.id|\.net\.id$/, 'Local Indonesian ISP / hosting'],
  [/digitalocean/, 'DigitalOcean'],
  [/linode|akamai/, 'Akamai / Linode'],
  [/vultr/, 'Vultr'],
  [/ovh\./, 'OVH'],
  [/hetzner|your-server\.de/, 'Hetzner'],
];

// Published at https://www.cloudflare.com/ips-v4
const CLOUDFLARE_V4 = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
  '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
  '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
];

export function fingerprintProvider(ip: string | undefined, cname: string | null, ptr: string | null): string {
  if (cname) for (const [re, name] of CNAME_RULES) if (re.test(cname)) return name;
  if (ip && CLOUDFLARE_V4.some((c) => inCidr(ip, c))) return 'Cloudflare';
  if (ptr) for (const [re, name] of PTR_RULES) if (re.test(ptr)) return name;
  return 'Unknown';
}

/** Shared CDN / SaaS edges: open ports there belong to the provider, not the customer. */
export function isSharedEdge(provider: string): boolean {
  return /Cloudflare|CloudFront|Akamai|Fastly|Vercel|Netlify|GitHub Pages|Google Workspace|Microsoft 365|SaaS/.test(provider);
}

/** When more than `cap` hosts are live, probe the ones an attacker would look at first. */
const INTERESTING = /(admin|stag|dev|uat|test|vpn|sso|login|portal|erp|hris|api|sandbox|internal|backoffice|jenkins|git|kibana|grafana|db|cms|old|backup|demo|beta)/;

export function prioritize(records: DnsRecord[], cap: number): DnsRecord[] {
  const rank = (r: DnsRecord) => (INTERESTING.test(r.hostname.split('.')[0]) ? 0 : 1);
  return [...records].sort((a, b) => rank(a) - rank(b) || a.hostname.localeCompare(b.hostname)).slice(0, cap);
}
