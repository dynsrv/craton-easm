'use client';

import { ArrowDown, ArrowRight, Scissors } from 'lucide-react';
import { Fragment } from 'react';
import { Card } from '@/components/ui/card';
import { sevName, SEV_VAR, type Dict } from '@/lib/i18n';
import type { AttackPath, AttackPathNode, Lang, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

const KIND_TONE: Record<AttackPathNode['kind'], string> = {
  entry: 'var(--color-high)',
  pivot: 'var(--color-med)',
  objective: 'var(--color-crit)',
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
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      {label}
      <span className="font-medium" style={{ color: SEV_VAR[value] }}>
        {sevName(value, lang)}
      </span>
    </span>
  );
}

export function AttackPaths({ paths, lang, t, onHost }: { paths: AttackPath[]; lang: Lang; t: Dict; onHost: (hostname: string) => void }) {
  if (!paths.length) {
    return <Card className="py-12 text-center text-muted">{t.pathsEmpty}</Card>;
  }
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-[80ch] text-muted">{t.pathsIntro}</p>
      {paths.map((p, i) => {
        const nodes = ordered(p);
        const edgeLabel = (from: string, to: string) => p.edges.find((e) => e.from === from && e.to === to)?.label[lang];
        return (
          <Card key={i} className="flex flex-col gap-5">
            <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">
                  {lang === 'id' ? 'Jalur' : 'Path'} {i + 1}
                  {p.source === 'heuristic' && <span className="ml-2 rounded-sm border border-line px-1.5 py-px font-normal">{t.ruleBased}</span>}
                </p>
                <h2 className="mt-0.5 text-base font-semibold leading-6">{p.title[lang]}</h2>
                <p className="mt-1 max-w-[80ch] text-[13px] leading-5 text-muted">{p.summary[lang]}</p>
              </div>
              <div className="flex shrink-0 gap-4 pt-0.5">
                <Level label={t.likelihood} value={p.likelihood} lang={lang} />
                <Level label={t.impact} value={p.impact} lang={lang} />
              </div>
            </header>

            <ol className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-stretch" aria-label={p.title[lang]}>
              {nodes.map((n, j) => {
                const choke = n.id === p.chokePoint.nodeId;
                const label = j > 0 ? edgeLabel(nodes[j - 1].id, n.id) : undefined;
                return (
                  <Fragment key={n.id}>
                    {j > 0 && (
                      <li aria-hidden className="flex shrink-0 items-center justify-center gap-2 py-1.5 text-muted lg:w-[120px] lg:flex-col lg:gap-1 lg:px-1 lg:py-0">
                        <ArrowRight className="hidden size-4 lg:block" />
                        <ArrowDown className="size-4 lg:hidden" />
                        {label && <span className="text-center text-[11px] leading-4">{label}</span>}
                      </li>
                    )}
                    <li
                      className={cn('relative flex min-w-0 flex-1 flex-col gap-1.5 rounded-md border bg-bg p-3.5', choke ? 'border-low' : 'border-line')}
                      style={{ boxShadow: `inset 0 3px 0 ${KIND_TONE[n.kind]}` }}
                    >
                      {choke && (
                        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-sm bg-low px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-inverse)]">
                          <Scissors className="size-3" aria-hidden />
                          {t.breakChain}
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-muted">{t.nodeKind[n.kind]}</span>
                      <span className="text-[13px] font-semibold leading-5">{n.label[lang]}</span>
                      {n.hostname && (
                        <button onClick={() => onHost(n.hostname!)} className="w-fit break-all text-left font-mono text-xs text-accent hover:underline">
                          {n.hostname}
                        </button>
                      )}
                      <span className="line-clamp-3 text-xs leading-4 text-muted" title={n.evidence}>
                        {n.evidence}
                      </span>
                    </li>
                  </Fragment>
                );
              })}
            </ol>

            <div className="flex items-start gap-3 rounded-md border border-line bg-bg p-3.5" style={{ boxShadow: 'inset 3px 0 0 var(--color-low)' }}>
              <Scissors className="mt-0.5 size-4 shrink-0 text-low" aria-hidden />
              <div>
                <p className="text-xs font-medium text-muted">{t.breakChain}</p>
                <p className="text-[13px] leading-5">{p.chokePoint.action[lang]}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
