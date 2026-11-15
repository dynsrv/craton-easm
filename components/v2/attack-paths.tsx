'use client';

import { ArrowDown, DoorOpen, Scissors, Shuffle, Target, type LucideIcon } from 'lucide-react';
import { Callout } from '@/components/ui/callout';
import { Card } from '@/components/ui/card';
import { sevName, SEV_VAR, type Dict } from '@/lib/i18n';
import type { AttackPath, AttackPathNode, Lang, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

const KIND: Record<AttackPathNode['kind'], { icon: LucideIcon }> = {
  entry: { icon: DoorOpen },
  pivot: { icon: Shuffle },
  objective: { icon: Target },
};

/** Orders nodes by following edges from the entry; falls back to the order the model returned. */
function ordered(path: AttackPath): AttackPathNode[] {
  const byId = new Map(path.nodes.map((n) => [n.id, n]));
  const start = path.nodes.find((n) => n.kind === 'entry') ?? path.nodes[0];
  const out: AttackPathNode[] = [start];
  const seen = new Set([start.id]);
  let cur = start;
  for (let i = 0; i < path.nodes.length; i++) {
    const next = path.edges.find((e) => e.from === cur.id && !seen.has(e.to));
    if (!next || !byId.has(next.to)) break;
    cur = byId.get(next.to)!;
    seen.add(cur.id);
    out.push(cur);
  }
  return out.length === path.nodes.length ? out : path.nodes;
}

function Level({ label, value, lang }: { label: string; value: Severity; lang: Lang }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold leading-5" style={{ color: SEV_VAR[value] }}>
        <span className="size-2 rounded-full" style={{ background: SEV_VAR[value] }} aria-hidden />
        {sevName(value, lang)}
      </span>
    </div>
  );
}

/** One step of the chain: numbered marker on a connector line, then the step card. */
function Step({
  node,
  index,
  last,
  choke,
  next,
  lang,
  t,
  onHost,
}: {
  node: AttackPathNode;
  index: number;
  last: boolean;
  choke: boolean;
  next?: string;
  lang: Lang;
  t: Dict;
  onHost: (hostname: string) => void;
}) {
  const Kind = KIND[node.kind].icon;
  return (
    <li className="flex gap-4 lg:flex-col lg:gap-3">
      {/* Marker: vertical rail on phones, horizontal rail on wide screens */}
      <div className="flex flex-col items-center lg:flex-row" aria-hidden>
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular',
            choke ? 'border-low bg-low text-[var(--color-inverse)]' : 'border-line bg-panel text-muted',
          )}
        >
          {choke ? <Scissors className="size-3.5" /> : index + 1}
        </span>
        {!last && (
          <span className="relative flex flex-1 items-center justify-center lg:-mr-4 lg:ml-2 lg:min-w-0">
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line lg:inset-x-0 lg:inset-y-auto lg:left-0 lg:top-1/2 lg:h-px lg:w-auto lg:translate-x-0" />
            {next && (
              <span className="relative hidden max-w-full truncate bg-panel px-2 text-[11px] leading-4 text-muted lg:inline">{next}</span>
            )}
          </span>
        )}
      </div>

      <div className={cn('mb-4 flex min-w-0 flex-1 flex-col gap-2 rounded-md border bg-bg p-4 lg:mb-0', choke ? 'border-low' : 'border-line')}>
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <Kind className="size-3.5" strokeWidth={1.75} aria-hidden />
            {t.nodeKind[node.kind]}
          </span>
          {choke && <span className="text-low">{t.breakHere}</span>}
        </div>
        <p className="text-sm font-semibold leading-5">{node.label[lang]}</p>
        {node.hostname && (
          <button onClick={() => onHost(node.hostname!)} className="w-fit [overflow-wrap:anywhere] text-left font-mono text-xs leading-4 text-accent hover:underline">
            {node.hostname}
          </button>
        )}
        <p className="text-xs leading-[18px] text-muted [overflow-wrap:anywhere]">{node.evidence}</p>
        {next && !last && (
          <p className="flex items-center gap-1.5 border-t border-line pt-2 text-[11px] leading-4 text-muted lg:hidden">
            <ArrowDown className="size-3" aria-hidden />
            {next}
          </p>
        )}
      </div>
    </li>
  );
}

export function AttackPaths({ paths, lang, t, onHost }: { paths: AttackPath[]; lang: Lang; t: Dict; onHost: (hostname: string) => void }) {
  if (!paths.length) {
    return <Card className="py-12 text-center text-muted">{t.pathsEmpty}</Card>;
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted">{t.pathsIntro}</p>
      {paths.map((p, i) => {
        const nodes = ordered(p);
        const edgeLabel = (from: string, to?: string) => (to ? p.edges.find((e) => e.from === from && e.to === to)?.label[lang] : undefined);
        const chokeIndex = nodes.findIndex((n) => n.id === p.chokePoint.nodeId);
        return (
          <Card key={i} className="flex flex-col gap-6 p-6">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-medium text-muted">
                    {lang === 'id' ? 'Jalur' : 'Path'} {i + 1}
                    {p.source === 'heuristic' && <span className="rounded-sm border border-line px-1.5 py-px font-normal">{t.ruleBased}</span>}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-7">{p.title[lang]}</h2>
                </div>
                <div className="flex shrink-0 gap-8">
                  <Level label={t.likelihood} value={p.likelihood} lang={lang} />
                  <Level label={t.impact} value={p.impact} lang={lang} />
                </div>
              </div>
              <p className="text-[13px] leading-5 text-muted">{p.summary[lang]}</p>
            </header>

            <ol
              // Equal-width steps on wide screens, whatever the chain length
              className="grid lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-x-4"
              style={{ '--steps': nodes.length } as React.CSSProperties}
              aria-label={p.title[lang]}
            >
              {nodes.map((n, j) => (
                <Step
                  key={n.id}
                  node={n}
                  index={j}
                  last={j === nodes.length - 1}
                  choke={j === chokeIndex}
                  next={edgeLabel(n.id, nodes[j + 1]?.id)}
                  lang={lang}
                  t={t}
                  onHost={onHost}
                />
              ))}
            </ol>

            <Callout tone="fix" icon={Scissors} title={chokeIndex >= 0 ? t.breakAtStep(chokeIndex + 1) : t.breakChain}>
              <p>{p.chokePoint.action[lang]}</p>
            </Callout>
          </Card>
        );
      })}
    </div>
  );
}
