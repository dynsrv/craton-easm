import {
  BrainCircuit,
  Cloud,
  CodeXml,
  FileText,
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
  overview: { icon: LayoutDashboard, tone: 'var(--color-accent)' },
  score: { icon: Gauge, tone: 'var(--color-accent)' },
  discovery: { icon: Radar, tone: 'var(--color-accent)' },
  dns: { icon: Network, tone: 'var(--color-accent)' },
  assets: { icon: Server, tone: 'var(--color-accent)' },
  takeover: { icon: Unlink, tone: 'var(--color-tone-rose)' },
  visual: { icon: ScanEye, tone: 'var(--color-tone-violet)' },
  code_leak: { icon: CodeXml, tone: 'var(--color-tone-amber)' },
  bucket: { icon: Cloud, tone: 'var(--color-tone-sky)' },
  email: { icon: MailCheck, tone: 'var(--color-tone-teal)' },
  exposures: { icon: ShieldAlert, tone: 'var(--color-tone-rose)' },
  triage: { icon: BrainCircuit, tone: 'var(--color-tone-violet)' },
  paths: { icon: Route, tone: 'var(--color-tone-amber)' },
  drift: { icon: History, tone: 'var(--color-tone-teal)' },
  brief: { icon: FileText, tone: 'var(--color-accent)' },
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
