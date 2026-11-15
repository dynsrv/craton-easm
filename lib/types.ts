export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Info'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CATEGORIES = [
  'Production Web',
  'Staging / Dev / UAT',
  'Admin / Login Portal',
  'API Endpoint',
  'Mail / VPN / Infra',
  'Shadow IT / Forgotten Asset',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Lang = 'en' | 'id';
export interface Bilingual {
  en: string;
  id: string;
}

export interface TlsInfo {
  valid: boolean;
  daysLeft: number;
  issuer: string | null;
  error: string | null;
}

export interface HttpProbe {
  scheme: 'https' | 'http';
  status: number;
  finalUrl: string;
  title: string | null;
  hasLoginForm: boolean;
  server: string | null;
  poweredBy: string | null;
  hsts: boolean;
  csp: boolean;
  tls: TlsInfo | null;
}

/** Everything Phase A knows about one hostname. */
export interface DiscoveredAsset {
  hostname: string;
  ips: string[];
  cname: string | null;
  provider: string;
  http: HttpProbe | null;
  ports: number[];
  cves: string[];
}

export interface Triage {
  hostname: string;
  category: Category;
  severity: Severity;
  exposureReasoning: Bilingual;
  remediationStep: Bilingual;
  source: 'llm' | 'heuristic';
}

export interface ExecutiveBrief {
  summary: Bilingual;
  topFixes: { title: Bilingual; detail: Bilingual; hostnames: string[] }[];
}

/** Shapes returned by the API (JSON columns already parsed). */
export interface AssetDTO {
  id: string;
  hostname: string;
  ips: string[];
  cname: string | null;
  provider: string;
  scheme: string | null;
  httpStatus: number | null;
  finalUrl: string | null;
  title: string | null;
  hasLoginForm: boolean;
  server: string | null;
  poweredBy: string | null;
  hsts: boolean;
  csp: boolean;
  tlsValid: boolean | null;
  tlsDaysLeft: number | null;
  tlsIssuer: string | null;
  tlsError: string | null;
  ports: number[];
  cves: string[];
  category: Category | null;
  severity: Severity | null;
  reasoning: Bilingual | null;
  remediation: Bilingual | null;
  triageSource: string | null;
}

export interface ScanDTO {
  id: string;
  domain: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  phase: number;
  log: string[];
  source: string | null;
  namesFound: number;
  score: number | null;
  brief: ExecutiveBrief | null;
  triagedBy: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
  assets: AssetDTO[];
}
