'use client';

import { Check, Radar } from 'lucide-react';
import type { RefObject } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { PHASE_ICONS } from '@/lib/modules';
import { cn } from '@/lib/utils';

/** Live scan card: a vertical stepper on the left and a terminal on the right, both stretched to one height. */
export function ScanProgress({
  title,
  domain,
  phases,
  phase,
  log,
  footer,
  stepLabel,
  logRef,
}: {
  title: string;
  domain: string;
  phases: string[];
  phase: number;
  log: string[];
  footer: string;
  stepLabel: (current: number, total: number) => string;
  logRef?: RefObject<HTMLPreElement | null>;
}) {
  const total = phases.length;
  const pct = Math.round((phase / total) * 100);
  const last = log.length - 1;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <CardTitle icon={Radar}>{title}</CardTitle>
        <p className="tabular shrink-0 text-xs text-muted">
          {stepLabel(Math.min(phase + 1, total), total)} <span className="mx-1 text-line">/</span> <b className="font-semibold text-ink">{pct}%</b>
        </p>
      </div>

      <div className="mt-1 grid items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <ol className="flex flex-col">
          {phases.map((p, i) => {
            const done = i < phase;
            const active = i === phase;
            const Icon = PHASE_ICONS[i];
            return (
              <li key={p} className="relative flex gap-3.5 pb-3.5 last:pb-0" aria-current={active ? 'step' : undefined}>
                {i < total - 1 && <span className={cn('absolute left-[13px] top-7 bottom-0 w-px', done ? 'bg-ok/60' : 'bg-line')} aria-hidden />}
                <span
                  className={cn(
                    'relative z-[1] grid size-7 shrink-0 place-items-center border transition-colors duration-300',
                    done && 'border-ok/60 bg-ok/10 text-ok',
                    active && 'border-accent bg-accent/10 text-accent',
                    !done && !active && 'border-line bg-panel text-muted',
                  )}
                >
                  {active && <span className="absolute inset-0 animate-ping border border-accent opacity-40 motion-reduce:hidden" aria-hidden />}
                  {done ? <Check className="size-4" strokeWidth={2.25} aria-hidden /> : <Icon className="size-4" strokeWidth={1.75} aria-hidden />}
                </span>
                <span className={cn('min-w-0 pt-[3px] text-[14px] leading-5', done && 'text-ink', active && 'font-medium text-ink', !done && !active && 'text-muted')}>{p}</span>
              </li>
            );
          })}
        </ol>

        <div className="flex min-h-[260px] min-w-0 flex-col overflow-hidden border border-line bg-bg text-ink shadow-[0_12px_32px_-22px_rgba(0,0,0,0.35)]">
          <div className="flex h-9 shrink-0 items-center gap-3 border-b border-line bg-panel2 px-3.5">
            <span className="flex gap-1.5" aria-hidden>
              <i className="size-2 rounded-full bg-line" />
              <i className="size-2 rounded-full bg-line" />
              <i className="size-2 rounded-full bg-line" />
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">craton · {domain}</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-ok">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-1.5 rounded-full bg-ok" />
              </span>
              LIVE
            </span>
          </div>
          <pre ref={logRef} aria-live="polite" className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-4 py-3.5 font-mono text-xs leading-[1.7]">
            {log.map((line, i) => {
              const cmd = line.startsWith('$');
              const sub = !cmd && line.startsWith(' ');
              return (
                <span key={i} className={cn('block', cmd && 'text-accent', sub && 'pl-4 text-muted', !cmd && !sub && 'text-ink')}>
                  {!cmd && !sub && <span className="mr-2 text-ok">›</span>}
                  {sub ? line.trim() : line}
                  {i === last && <span className="ml-1 inline-block h-[1em] w-[7px] translate-y-[2px] animate-pulse bg-accent motion-reduce:animate-none" aria-hidden />}
                </span>
              );
            })}
          </pre>
        </div>
      </div>

      <div className="mt-5 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={title}>
        {phases.map((p, i) => (
          <span key={p} className={cn('h-1 flex-1 transition-colors duration-500', i < phase ? 'bg-ok' : i === phase ? 'animate-pulse bg-accent motion-reduce:animate-none' : 'bg-panel2')} />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted">{footer}</p>
    </Card>
  );
}
