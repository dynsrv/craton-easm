import { inScope, isValidHostname } from './domain';

const UA = 'Craton-EASM/0.1 (+passive external exposure review)';

interface CrtShRow {
  name_value?: string;
  common_name?: string;
}

/**
 * Certificate Transparency lookup. Returns every unique hostname under `domain`
 * that has ever appeared on a publicly logged certificate.
 * Throws when crt.sh is down, slow or rate-limiting; the caller then uses the DNS fallback.
 */
export async function fetchCtSubdomains(domain: string, timeoutMs = 25_000): Promise<string[]> {
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${domain}`)}&output=json`;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`crt.sh responded ${res.status}`);
      const rows = (await res.json()) as CrtShRow[];
      if (!Array.isArray(rows)) throw new Error('crt.sh returned an unexpected payload');
      return normalizeCtNames(rows, domain);
    } catch (err) {
      lastError = err;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('crt.sh lookup failed');
}

export function normalizeCtNames(rows: CrtShRow[], domain: string): string[] {
  const names = new Set<string>();
  for (const row of rows) {
    for (const raw of `${row.name_value ?? ''}\n${row.common_name ?? ''}`.split(/\s+/)) {
      const name = raw.trim().toLowerCase().replace(/^\*\./, '').replace(/\.$/, '');
      // drop emails (S/MIME certs), other domains and malformed entries
      if (!name || name.includes('@') || !isValidHostname(name) || !inScope(name, domain)) continue;
      names.add(name);
    }
  }
  return [...names].sort();
}
