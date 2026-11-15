import { isIP } from 'node:net';

const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

/** Accepts "https://www.Company.co.id/path" and returns "company.co.id". Throws on anything that is not a public domain name. */
export function normalizeDomain(input: string): string {
  const d = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#:].*$/, '')
    .replace(/^\*\./, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '');
  if (!d || isIP(d) || !HOSTNAME_RE.test(d)) throw new Error('Enter a root domain such as company.co.id');
  if (d === 'localhost' || /\.(local|internal|lan|home|test|invalid|localhost)$/.test(d)) {
    throw new Error('Only public domains can be scanned');
  }
  return d;
}

export function isValidHostname(h: string): boolean {
  return HOSTNAME_RE.test(h);
}

export function inScope(hostname: string, rootDomain: string): boolean {
  return hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
}

export function inCidr(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split('/');
  const bits = Number(bitsStr);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

const NON_PUBLIC = [
  '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12',
  '192.0.0.0/24', '192.168.0.0/16', '198.18.0.0/15', '224.0.0.0/3',
];

/**
 * SSRF guard. A scanned company's DNS can point at 127.0.0.1 or 10.x addresses;
 * probing those would hit OUR network, not theirs. Such hosts are recorded but never probed.
 */
export function isPublicIPv4(ip: string): boolean {
  return isIP(ip) === 4 && !NON_PUBLIC.some((c) => inCidr(ip, c));
}
