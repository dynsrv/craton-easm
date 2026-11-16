import { Info, Scale, TriangleAlert, Wrench, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES: Record<'fix' | 'warn' | 'info' | 'teal', { color: string; icon: LucideIcon }> = {
  teal: { color: 'var(--color-tone-teal)', icon: Scale },
  fix: { color: 'var(--color-ok)', icon: Wrench },
  warn: { color: 'var(--color-high)', icon: TriangleAlert },
  info: { color: 'var(--color-accent)', icon: Info },
};

/**
 * Tinted note with an icon: remediation steps, anomalies, hints.
 * Tone comes from a soft background and the icon, not a coloured border.
 */
export function Callout({ tone = 'info', title, icon, children, className }: { tone?: 'fix' | 'warn' | 'info' | 'teal'; title?: React.ReactNode; icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  const t = TONES[tone];
  const Icon = icon ?? t.icon;
  return (
    <div className={cn('flex gap-3 rounded-md px-4 py-3 text-[13px] leading-5', className)} style={{ background: `color-mix(in oklab, ${t.color} ${tone === 'teal' ? 14 : 9}%, var(--color-panel))` }}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', tone === 'teal' ? 'text-[var(--color-tone-teal)]' : 'text-muted')} strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
