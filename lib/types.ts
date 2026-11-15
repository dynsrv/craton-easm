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
  /** Filled by visual triage before AI triage, so the analyst sees what the page is. */
  visual?: { visualClass: VisualClass; product: string | null; anomalies: string[] };
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
  visualClass: VisualClass | null;
  visualProduct: string | null;
  visualAnomalies: Bilingual[];
  hasScreenshot: boolean;
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
  exposures: ExposureDTO[];
  attackPaths: AttackPath[];
  emailSecurity: EmailSecurity | null;
  driftEvents: DriftEventDTO[];
  baselineScanId: string | null;
  /** Score and date of the previous scan of this domain, for the trend. */
  baseline: { score: number | null; date: string } | null;
  monitored: boolean;
}

/* ---------- v2: exposures, visual triage, attack paths, drift ---------- */

export const VISUAL_CLASSES = [
  'Exposed Admin / DevOps Panel',
  'Unauthenticated API Docs',
  'Employee / Customer Login Portal',
  'Default Server / Parked / Under Construction Page',
  'Public Marketing Website',
  'Other / Unclear',
] as const;
export type VisualClass = (typeof VISUAL_CLASSES)[number];

export interface VisualResult {
  hostname: string;
  visualClass: VisualClass;
  product: string | null;
  anomalies: Bilingual[];
  source: 'llm' | 'heuristic';
  /** JPEG bytes, 1280x800. Held in memory, then stored for the asset. */
  screenshot: Buffer | null;
}

export type ExposureKind = 'takeover' | 'bucket' | 'code_leak' | 'email';

export interface ExposureFinding {
  kind: ExposureKind;
  severity: Severity;
  hostname: string | null;
  provider: string | null;
  /** What was checked: bucket URL, repository path, DNS record. Never contains secret values. */
  target: string;
  /** Redacted evidence (fingerprint matched, HTTP status, code fragment with secrets removed). */
  evidence: string;
  title: Bilingual;
  reasoning: Bilingual;
  remediation: Bilingual;
}

export interface EmailSecurity {
  spf: { record: string | null; policy: 'none' | 'pass-all' | 'neutral' | 'softfail' | 'fail' };
  dmarc: { record: string | null; policy: 'none' | 'monitor' | 'quarantine' | 'reject' };
}

export interface AttackPathNode {
  id: string;
  kind: 'entry' | 'pivot' | 'objective';
  label: Bilingual;
  hostname: string | null;
  evidence: string;
}

export interface AttackPath {
  title: Bilingual;
  summary: Bilingual;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'Critical' | 'High' | 'Medium';
  nodes: AttackPathNode[];
  edges: { from: string; to: string; label: Bilingual }[];
  chokePoint: { nodeId: string; action: Bilingual };
  source: 'llm' | 'heuristic';
}

export interface ExposureDTO extends ExposureFinding {
  id: string;
}

export interface DriftEventDTO {
  id: string;
  scanId: string;
  kind: string;
  severity: Severity;
  hostname: string | null;
  detail: Bilingual;
  createdAt: string;
  notifiedAt: string | null;
}
