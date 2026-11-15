/**
 * Secret redaction. Applied in memory to anything taken from public sources (code search fragments,
 * page titles, headers) BEFORE it is stored or sent to an LLM. Matches are replaced, never kept.
 */
const RULES: [string, RegExp][] = [
  ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END [A-Z ]*PRIVATE KEY-----|$)/g],
  ['aws-access-key', /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ['github-token', /\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g],
  ['slack-token', /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ['stripe-key', /\b(sk|rk)_(live|test)_[0-9A-Za-z]{16,}\b/g],
  ['jwt', /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
  ['bearer-token', /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{12,}/gi],
];

// user:password@host in connection strings and URLs: keep the user and host, drop the password.
const URL_CREDENTIALS = /\b([a-z][a-z0-9+.-]*:\/\/[^\s:/@'"]+):([^\s@/'"]+)@/gi;

// KEY=value / "key": "value" where the key names a secret.
const SECRET_KEY = '(?:[A-Za-z0-9_.-]*?(?:pass(?:word|wd)?|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|client[_-]?secret|auth|credential|salt|signing[_-]?key)[A-Za-z0-9_.-]*)';
const ASSIGNMENT = new RegExp(`(["']?${SECRET_KEY}["']?\\s*[:=]\\s*)(["']?)([^\\s"',;}{]{3,})\\2`, 'gi');

export interface RedactionResult {
  text: string;
  /** Types of secret found, e.g. ["aws-access-key", "assignment"]. No values. */
  found: string[];
}

export function redact(input: string): RedactionResult {
  const found = new Set<string>();
  let text = input;
  for (const [name, re] of RULES) {
    text = text.replace(re, () => {
      found.add(name);
      return `[REDACTED:${name}]`;
    });
  }
  text = text.replace(URL_CREDENTIALS, (_m, head: string) => {
    found.add('url-credentials');
    return `${head}:[REDACTED]@`;
  });
  text = text.replace(ASSIGNMENT, (m, lhs: string, quote: string, value: string) => {
    // leave placeholders, references and booleans alone: ${VAR}, process.env.X, true/false, already redacted
    if (/^(\$\{|process\.env|env\(|true$|false$|null$|none$|\[REDACTED|<|%|changeme$|your[_-]|xxx|\*\*\*)/i.test(value)) return m;
    found.add('assignment');
    return `${lhs}${quote}[REDACTED]${quote}`;
  });
  return { text, found: [...found] };
}

export const redactText = (s: string | null | undefined): string | null => (s == null ? s ?? null : redact(s).text);
