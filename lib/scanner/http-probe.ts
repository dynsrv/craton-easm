import http from 'node:http';
import https from 'node:https';
import type { LookupFunction } from 'node:net';
import type { TLSSocket } from 'node:tls';
import { Resolver } from 'node:dns/promises';
import type { HttpProbe, TlsInfo } from '../types';
import { inScope, isPublicIPv4 } from './domain';

const UA = 'Mozilla/5.0 (compatible; Craton-EASM/0.1; passive external exposure review)';
const MAX_BODY = 96 * 1024; // enough for <head> and a login form
const MAX_REDIRECTS = 3;
const resolver = new Resolver({ timeout: 3000, tries: 1 });

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  tls: TlsInfo | null;
}

/** Pin the connection to the IP we already vetted, so a DNS change mid-scan cannot redirect us to a private address. */
function pinnedLookup(ip: string): LookupFunction {
  return ((_hostname: string, options: unknown, callback: unknown) => {
    const cb = (typeof options === 'function' ? options : callback) as (
      err: NodeJS.ErrnoException | null,
      address: string | { address: string; family: number }[],
      family?: number,
    ) => void;
    const all = typeof options === 'object' && options !== null && (options as { all?: boolean }).all;
    if (all) cb(null, [{ address: ip, family: 4 }]);
    else cb(null, ip, 4);
  }) as LookupFunction;
}

function readTls(socket: TLSSocket): TlsInfo | null {
  const cert = socket.getPeerCertificate();
  if (!cert || !cert.valid_to) return null;
  const daysLeft = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000);
  const issuer = cert.issuer?.O ?? cert.issuer?.CN ?? null;
  return {
    valid: socket.authorized && daysLeft >= 0,
    daysLeft,
    issuer: Array.isArray(issuer) ? issuer[0] : issuer,
    // e.g. CERT_HAS_EXPIRED, DEPTH_ZERO_SELF_SIGNED_CERT, ERR_TLS_CERT_ALTNAME_INVALID
    error: socket.authorized ? null : String(socket.authorizationError ?? 'UNTRUSTED'),
  };
}

/** One plain GET. Certificates are inspected, not enforced, so expired and self-signed hosts can still be described. */
function requestOnce(url: URL, ip: string, timeoutMs: number): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const req = (isHttps ? https : http).request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Encoding': 'identity' },
        lookup: pinnedLookup(ip),
        agent: false,
        ...(isHttps ? { servername: url.hostname, rejectUnauthorized: false } : {}),
      },
      (res) => {
        const tls = isHttps ? readTls(res.socket as TLSSocket) : null;
        const chunks: Buffer[] = [];
        let size = 0;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(deadline);
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks).toString('utf8'), tls });
        };
        res.on('data', (c: Buffer) => {
          size += c.length;
          chunks.push(c);
          if (size >= MAX_BODY) {
            finish();
            res.destroy();
          }
        });
        res.on('end', finish);
        res.on('close', finish);
        res.on('error', finish);
      },
    );
    // hard deadline: covers slow connects, slow TLS and slow bodies alike
    const deadline = setTimeout(() => req.destroy(new Error('timeout')), timeoutMs);
    req.on('error', (err) => {
      clearTimeout(deadline);
      reject(err);
    });
    req.end();
  });
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]{1,300})/i);
  if (!m) return null;
  const t = m[1]
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t ? t.slice(0, 160) : null;
}

const first = (v: string | string[] | undefined): string | null => (Array.isArray(v) ? v[0] : v) ?? null;

async function fetchChain(start: URL, ip: string, rootDomain: string, timeoutMs: number) {
  let url = start;
  let currentIp = ip;
  let firstTls: TlsInfo | null = null;
  for (let hop = 0; ; hop++) {
    const res = await requestOnce(url, currentIp, timeoutMs);
    if (hop === 0) firstTls = res.tls;
    const location = first(res.headers.location);
    if (res.status < 300 || res.status >= 400 || !location || hop >= MAX_REDIRECTS) return { res, url, firstTls };

    let next: URL;
    try {
      next = new URL(location, url);
    } catch {
      return { res, url, firstTls };
    }
    // Stay inside the scanned organisation: never follow a redirect to someone else's host.
    if (!/^https?:$/.test(next.protocol) || !inScope(next.hostname, rootDomain)) return { res, url: next, firstTls };
    if (next.hostname !== url.hostname) {
      const ips = await resolver.resolve4(next.hostname).catch(() => [] as string[]);
      const pub = ips.find(isPublicIPv4);
      if (!pub) return { res, url: next, firstTls };
      currentIp = pub;
    }
    url = next;
  }
}

/**
 * Non-intrusive probe of one host: a standard GET to "/" over HTTPS, then HTTP if HTTPS fails.
 * No paths are guessed, nothing is posted, no credentials are tried.
 */
export async function probeHost(hostname: string, ip: string, rootDomain: string, timeoutMs = 5000): Promise<HttpProbe | null> {
  if (!isPublicIPv4(ip)) return null;

  for (const scheme of ['https', 'http'] as const) {
    try {
      const { res, url, firstTls } = await fetchChain(new URL(`${scheme}://${hostname}/`), ip, rootDomain, timeoutMs);
      const h = res.headers;
      return {
        scheme,
        status: res.status,
        finalUrl: url.toString(),
        title: extractTitle(res.body),
        hasLoginForm: /<input[^>]+type\s*=\s*["']?password/i.test(res.body),
        server: first(h.server),
        poweredBy: first(h['x-powered-by']),
        hsts: Boolean(h['strict-transport-security']),
        csp: Boolean(h['content-security-policy']),
        // the certificate that matters is the one served by the host we asked for
        tls: firstTls ?? res.tls,
      };
    } catch {
      // connection refused, timeout, TLS handshake failure: try plain HTTP, then give up
    }
  }
  return null;
}
