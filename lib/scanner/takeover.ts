import { Resolver } from 'node:dns/promises';
import pLimit from 'p-limit';
import type { ExposureFinding, Severity } from '../types';
import type { DnsRecord } from './dns';
import { isPublicIPv4 } from './domain';
import { requestOnce } from './http-probe';

/**
 * MODULE 1. Dangling DNS and subdomain takeover detection.
 *
 * A record is "dangling" when it still points (by CNAME) at a third-party service where the resource
 * behind it no longer exists. Whoever claims that resource next serves content on the company's domain.
 *
 * Checks are passive: DNS lookups, then at most one GET to "/" per candidate. Nothing is registered or claimed.
 * Status per provider follows the community list at https://github.com/EdOverflow/can-i-take-over-xyz
 * (reviewed November 2026). Re-check it periodically; providers change their claim rules.
 */

type Status = 'vulnerable' | 'edge-case' | 'not-vulnerable';

interface Fingerprint {
  provider: string;
  cname: RegExp;
  status: Status;
  /** Body text of the provider's "unclaimed" page. Omitted when the signature is NXDOMAIN on the CNAME target. */
  body?: RegExp;
  nxdomain?: boolean;
}

export const FINGERPRINTS: Fingerprint[] = [
  { provider: 'AWS S3', cname: /\.s3[.-]([a-z0-9-]+\.)?amazonaws\.com$|\.s3-website[.-][a-z0-9-]+\.amazonaws\.com$/, status: 'vulnerable', body: /NoSuchBucket|The specified bucket does not exist/i },
  { provider: 'AWS Elastic Beanstalk', cname: /\.elasticbeanstalk\.com$/, status: 'vulnerable', nxdomain: true },
  { provider: 'Microsoft Azure', cname: /\.(azurewebsites\.net|cloudapp\.net|cloudapp\.azure\.com|trafficmanager\.net|blob\.core\.windows\.net|azureedge\.net|azure-api\.net|azurefd\.net|azurecontainer\.io|azurestaticapps\.net)$/, status: 'vulnerable', nxdomain: true },
  { provider: 'Bitbucket', cname: /\.bitbucket\.io$/, status: 'vulnerable', body: /Repository not found/i },
  { provider: 'Pantheon', cname: /\.pantheonsite\.io$/, status: 'vulnerable', body: /404 error unknown site!/i },
  { provider: 'Surge.sh', cname: /\.surge\.sh$/, status: 'vulnerable', body: /project not found/i },
  { provider: 'Ghost', cname: /\.ghost\.io$/, status: 'vulnerable', body: /Site unavailable\.|Failed to resolve DNS path for this host/i },
  { provider: 'WordPress.com', cname: /\.wordpress\.com$/, status: 'vulnerable', body: /Do you want to register .*\.wordpress\.com\?/i },
  { provider: 'Readme.io', cname: /\.readme\.io$/, status: 'vulnerable', body: /The creators of this project are still working on making everything perfect!/i },
  { provider: 'Help Scout', cname: /\.helpscoutdocs\.com$/, status: 'vulnerable', body: /No settings were found for this company:/i },
  { provider: 'GitHub Pages', cname: /\.github\.io$/, status: 'edge-case', body: /There isn't a GitHub Pages site here\./i },
  { provider: 'Heroku', cname: /\.(herokuapp|herokudns|herokussl)\.com$/, status: 'edge-case', body: /No such app|herokucdn\.com\/error-pages\/no-such-app\.html/i },
  { provider: 'Vercel', cname: /\.(vercel-dns\.com|vercel\.app|now\.sh)$/, status: 'edge-case', body: /DEPLOYMENT_NOT_FOUND/i },
  { provider: 'Netlify', cname: /\.netlify\.(app|com)$/, status: 'edge-case', body: /Not Found - Request ID:/i },
  { provider: 'Shopify', cname: /\.myshopify\.com$|shops\.myshopify\.com$/, status: 'edge-case', body: /Sorry, this shop is currently unavailable\./i },
  { provider: 'Webflow', cname: /\.(webflow\.io|proxy\.webflow\.com|proxy-ssl\.webflow\.com)$/, status: 'edge-case', body: /The page you are looking for doesn't exist or has been moved\./i },
  { provider: 'Fastly', cname: /\.fastly\.net$|\.fastlylb\.net$/, status: 'not-vulnerable', body: /Fastly error: unknown domain/i },
  { provider: 'Zendesk', cname: /\.zendesk\.com$/, status: 'not-vulnerable', body: /Help Center Closed/i },
];

const SEVERITY: Record<Status, Severity> = { vulnerable: 'Critical', 'edge-case': 'High', 'not-vulnerable': 'Medium' };

const resolver = new Resolver({ timeout: 3000, tries: 2 });

export function matchProvider(cname: string): Fingerprint | undefined {
  const c = cname.toLowerCase().replace(/\.$/, '');
  return FINGERPRINTS.find((f) => f.cname.test(c));
}

/** True only for "this name does not exist", not for timeouts or SERVFAIL. */
async function isNxdomain(name: string): Promise<boolean> {
  try {
    await resolver.resolve4(name);
    return false;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOTFOUND') return false;
    // AAAA-only targets are alive: confirm there is no IPv6 record either.
    try {
      await resolver.resolve6(name);
      return false;
    } catch (e6) {
      return (e6 as NodeJS.ErrnoException).code === 'ENOTFOUND' || (e6 as NodeJS.ErrnoException).code === 'ENODATA';
    }
  }
}

export interface DanglingCandidate {
  hostname: string;
  cname: string;
}

/**
 * Names that no longer resolve to an address but still carry a CNAME: discovery drops them as dead,
 * yet they are exactly the records that can be taken over (Azure, Elastic Beanstalk).
 */
export async function findCnameOnlyRecords(deadNames: string[], max = 250): Promise<DanglingCandidate[]> {
  const limit = pLimit(8);
  const out = await Promise.all(
    deadNames.slice(0, max).map((hostname) =>
      limit(async () => {
        try {
          const [cname] = await resolver.resolveCname(hostname);
          return cname ? { hostname, cname: cname.toLowerCase() } : null;
        } catch {
          return null;
        }
      }),
    ),
  );
  return out.filter((c): c is DanglingCandidate => c !== null);
}

/** One GET to "/" (HTTPS, then HTTP), pinned to the vetted IP, body capped by requestOnce. */
async function fetchBody(hostname: string, ip: string): Promise<{ status: number; body: string } | null> {
  for (const scheme of ['https', 'http'] as const) {
    try {
      const res = await requestOnce(new URL(`${scheme}://${hostname}/`), ip, 6000);
      return { status: res.status, body: res.body };
    } catch {
      /* try the next scheme */
    }
  }
  return null;
}

export function takeoverFinding(hostname: string, cname: string, fp: Fingerprint, evidence: string): ExposureFinding {
  const sev = SEVERITY[fp.status];
  const claimable = fp.status === 'vulnerable';
  const edge = fp.status === 'edge-case';
  return {
    kind: 'takeover',
    severity: sev,
    hostname,
    provider: fp.provider,
    target: `${hostname} CNAME ${cname}`,
    evidence,
    title: {
      en: claimable ? `Subdomain takeover risk on ${hostname}` : `Dangling DNS record on ${hostname}`,
      id: claimable ? `Risiko pengambilalihan subdomain pada ${hostname}` : `Record DNS menggantung pada ${hostname}`,
    },
    reasoning: claimable
      ? {
          en: `${hostname} points to ${fp.provider} (${cname}), but the resource there no longer exists. Anyone who registers that resource name on ${fp.provider} can publish content under your domain: phishing pages, malware, or scripts that read cookies scoped to the parent domain.`,
          id: `${hostname} mengarah ke ${fp.provider} (${cname}), tetapi resource di sana sudah tidak ada. Siapa pun yang mendaftarkan nama resource itu di ${fp.provider} dapat menayangkan konten di bawah domain Anda: halaman phishing, malware, atau skrip yang membaca cookie domain induk.`,
        }
      : edge
        ? {
            en: `${hostname} points to ${fp.provider} (${cname}) but nothing is configured there. ${fp.provider} limits who can claim a custom domain, so takeover is not straightforward, but the record is stale and should be removed.`,
            id: `${hostname} mengarah ke ${fp.provider} (${cname}) tetapi tidak ada yang dikonfigurasi di sana. ${fp.provider} membatasi siapa yang bisa mengklaim custom domain, jadi pengambilalihan tidak mudah, namun record ini usang dan sebaiknya dihapus.`,
          }
        : {
            en: `${hostname} points to ${fp.provider} (${cname}) which reports the domain as unknown. ${fp.provider} does not allow third parties to claim it, so this is DNS hygiene rather than a takeover risk.`,
            id: `${hostname} mengarah ke ${fp.provider} (${cname}) yang melaporkan domain sebagai tidak dikenal. ${fp.provider} tidak mengizinkan pihak lain mengklaimnya, jadi ini masalah kebersihan DNS, bukan risiko pengambilalihan.`,
          },
    remediation: {
      en: `1) Confirm nobody in your team still uses ${hostname}. 2) Delete the CNAME record for ${hostname} at your DNS provider (or re-create the ${fp.provider} resource and claim it under your account). 3) Re-run the scan to confirm the record is gone. 4) Add a DNS-removal step to your decommissioning checklist so cloud resources and their DNS records are retired together.`,
      id: `1) Pastikan tidak ada tim yang masih memakai ${hostname}. 2) Hapus record CNAME ${hostname} di penyedia DNS Anda (atau buat ulang resource ${fp.provider} dan klaim di akun Anda). 3) Jalankan scan ulang untuk memastikan record sudah hilang. 4) Tambahkan langkah penghapusan DNS ke checklist decommissioning agar resource cloud dan record DNS-nya dihentikan bersamaan.`,
    },
  };
}

/**
 * Check live records with a provider CNAME (body signature) and CNAME-only records (NXDOMAIN signature).
 */
export async function detectTakeovers(live: DnsRecord[], cnameOnly: DanglingCandidate[], onLog: (m: string) => void = () => {}): Promise<ExposureFinding[]> {
  const findings: ExposureFinding[] = [];
  const limit = pLimit(6);

  // CNAME target no longer exists
  await Promise.all(
    cnameOnly.map((c) =>
      limit(async () => {
        const fp = matchProvider(c.cname);
        if (!fp) return;
        if (await isNxdomain(c.cname)) {
          findings.push(takeoverFinding(c.hostname, c.cname, fp, `CNAME target ${c.cname} returns NXDOMAIN`));
          onLog(`  dangling: ${c.hostname} -> ${c.cname} (NXDOMAIN)`);
        }
      }),
    ),
  );

  // CNAME target answers with the provider's "unclaimed" page
  await Promise.all(
    live
      .filter((r) => r.cname && matchProvider(r.cname)?.body)
      .map((r) =>
        limit(async () => {
          const fp = matchProvider(r.cname!)!;
          const ip = r.ips.find(isPublicIPv4);
          if (!ip) return;
          const res = await fetchBody(r.hostname, ip);
          if (res && fp.body!.test(res.body)) {
            const sig = res.body.match(fp.body!)?.[0] ?? 'signature';
            findings.push(takeoverFinding(r.hostname, r.cname!, fp, `HTTP ${res.status}, body contains "${sig.slice(0, 80)}"`));
            onLog(`  dangling: ${r.hostname} -> ${r.cname} (${fp.provider} unclaimed page)`);
          }
        }),
      ),
  );

  return findings;
}
