import {
  BrainCircuit,
  Cloud,
  CodeXml,
  FileText,
  Scale,
  Gauge,
  History,
  LayoutDashboard,
  MailCheck,
  Network,
  Radar,
  Route,
  ScanEye,
  Server,
  ShieldAlert,
  Unlink,
  type LucideIcon,
} from 'lucide-react';

/**
 * One icon and accent per capability, used consistently on tabs, card titles, scan phases,
 * exposure groups and the module overview, so each module is recognisable at a glance.
 */
export interface ModuleStyle {
  icon: LucideIcon;
  /** CSS colour used for the icon and its tinted tile. */
  tone: string;
}

export const MODULE: Record<string, ModuleStyle> = {
  overview: { icon: LayoutDashboard, tone: 'var(--color-muted)' },
  score: { icon: Gauge, tone: 'var(--color-muted)' },
  discovery: { icon: Radar, tone: 'var(--color-muted)' },
  dns: { icon: Network, tone: 'var(--color-muted)' },
  assets: { icon: Server, tone: 'var(--color-muted)' },
  takeover: { icon: Unlink, tone: 'var(--color-muted)' },
  visual: { icon: ScanEye, tone: 'var(--color-muted)' },
  code_leak: { icon: CodeXml, tone: 'var(--color-muted)' },
  bucket: { icon: Cloud, tone: 'var(--color-muted)' },
  email: { icon: MailCheck, tone: 'var(--color-muted)' },
  exposures: { icon: ShieldAlert, tone: 'var(--color-muted)' },
  triage: { icon: BrainCircuit, tone: 'var(--color-muted)' },
  paths: { icon: Route, tone: 'var(--color-muted)' },
  drift: { icon: History, tone: 'var(--color-muted)' },
  brief: { icon: FileText, tone: 'var(--color-muted)' },
  compliance: { icon: Scale, tone: 'var(--color-muted)' },
};

/** Icons for the nine scan phases, in pipeline order. */
export const PHASE_ICONS: LucideIcon[] = [
  MODULE.discovery.icon,
  MODULE.dns.icon,
  MODULE.assets.icon,
  ShieldAlert,
  MODULE.takeover.icon,
  MODULE.visual.icon,
  MODULE.triage.icon,
  MODULE.paths.icon,
  MODULE.drift.icon,
];
