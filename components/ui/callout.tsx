import { Info, TriangleAlert, Wrench, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES: Record<'fix' | 'warn' | 'info', { color: string; icon: LucideIcon }> = {
  fix: { color: 'var(--color-low)', icon: Wrench },
  warn: { color: 'var(--color-high)', icon: TriangleAlert },
  info: { color: 'var(--color-accent)', icon: Info },
};

/**
 * Tinted note with an icon: remediation steps, anomalies, hints.
 * Tone comes from a soft background and the icon, not a coloured border.
 */
export function Callout({ tone = 'info', title, icon, children, className }: { tone?: 'fix' | 'warn' | 'info'; title?: React.ReactNode; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  const t = TONES[tone];
  const Icon = icon ?? t.icon;
  return (
    <div className={cn('flex gap-3 rounded-md px-4 py-3 text-[13px] leading-5', className)} style={{ background: `color-mix(in oklab, ${t.color} 9%, var(--color-panel))` }}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 text-xs font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
