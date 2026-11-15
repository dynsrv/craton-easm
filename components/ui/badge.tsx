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
      className={cn('inline-flex h-[22px] items-center whitespace-nowrap rounded-sm border px-2 text-xs font-medium', className)}
      style={{ borderColor: color, color: solid ? 'var(--color-inverse)' : color, background: solid ? color : 'transparent' }}
    >
      {label}
    </span>
  );
}

export function PortChip({ port, risky }: { port: number; risky: boolean }) {
  return (
    <span className={cn('tabular inline-flex h-5 items-center rounded-sm border px-1.5 font-mono text-xs', risky ? 'border-crit text-crit' : 'border-line text-muted')}>{port}</span>
  );
}

/** Small filled dot in the severity colour, for compact lists. */
export function SeverityDot({ severity, className }: { severity: Severity; className?: string }) {
  return <span className={cn('inline-block size-2 shrink-0 rounded-full', className)} style={{ background: SEV_VAR[severity] }} aria-hidden />;
}
