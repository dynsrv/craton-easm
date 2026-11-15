import * as React from 'react';
import { SEV_VAR } from '@/lib/i18n';
import type { Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Severity pill. Critical is filled so it stands out without relying on colour alone. */
export function SeverityBadge({ severity, label, className }: { severity: Severity; label: string; className?: string }) {
  const color = SEV_VAR[severity];
  const solid = severity === 'Critical';
  return (
    <span
      className={cn('inline-block whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]', className)}
      style={{ borderColor: color, color: solid ? '#111418' : color, background: solid ? color : 'transparent' }}
    >
      {label}
    </span>
  );
}

export function PortChip({ port, risky }: { port: number; risky: boolean }) {
  return (
    <span className={cn('mb-1 mr-1 inline-block rounded border px-1.5 font-mono text-xs', risky ? 'border-crit text-crit' : 'border-line')}>{port}</span>
  );
}
