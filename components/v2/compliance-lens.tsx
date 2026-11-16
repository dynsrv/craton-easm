'use client';

import { ArrowUpRight, Banknote, Building2, ChevronDown, CircleCheck, CreditCard, Factory, Landmark, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSector } from '@/components/use-sector';
import { SeverityBadge } from '@/components/ui/badge';
import { Callout } from '@/components/ui/callout';
import { Card, CardTitle } from '@/components/ui/card';
import { appliesTo, FIX, matchScan, PLAIN, regById, rollUp, SECTORS, UI, type Sector } from '@/lib/compliance';
import { sevName } from '@/lib/i18n';
import { MODULE } from '@/lib/modules';
import { SEVERITY_RANK } from '@/lib/score';
import type { Lang, ScanDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICON: Record<Sector, LucideIcon> = { any: Building2, bank: Landmark, payments: CreditCard, finance: Banknote, cii: Factory };

/**
 * Compliance tab. Reads the finished scan and shows which duties and controls each finding
 * type may touch. It is a lens over existing data: nothing new is collected.
 */
export function ComplianceLens({ scan, lang }: { scan: ScanDTO; lang: Lang }) {
  const u = UI[lang];
  const [sector, setSector] = useSector();
  const hits = useMemo(() => matchScan(scan), [scan]);
  const roll = useMemo(() => rollUp(hits), [hits]);
  const withFindings = hits.filter((h) => h.count > 0).sort((a, b) => (a.worst ? SEVERITY_RANK[a.worst] : 9) - (b.worst ? SEVERITY_RANK[b.worst] : 9) || b.count - a.count);
  const clear = hits.filter((h) => h.count === 0);
  const mine = roll.filter((r) => appliesTo(r.reg, sector)).sort((a, b) => b.flagged - a.flagged || b.related - a.related);
  const inPlay = mine.filter((r) => r.flagged > 0).length;
  const sectorLabel = SECTORS.find((s) => s.id === sector)!.label[lang];

  return (
    <div className="flex flex-col gap-6">
      <Callout tone="teal" title={u.lensTitle}>
        <p>{u.lensLead}</p>
        <Link href="/compliance" className="mt-1.5 inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:no-underline">
          {u.openGuide}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </Callout>

      {/* Summary band */}
      <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {[
          { big: withFindings.length, of: hits.length, label: u.sumFlagged(withFindings.length, hits.length), tone: withFindings.length ? 'text-ink' : 'text-muted' },
          { big: clear.length, of: hits.length, label: u.sumClear(clear.length), tone: 'text-muted' },
          { big: inPlay, of: mine.length, label: u.sumRules(inPlay), tone: inPlay ? 'text-ink' : 'text-muted' },
        ].map((c, i) => (
          <div key={i} className="flex items-baseline gap-3 bg-panel px-5 py-4">
            <span className={cn('tabular font-mono text-[28px] font-light leading-none', c.tone)}>{c.big}</span>
            <span className="text-[13px] leading-5 text-muted">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Sector picker */}
      <div>
        <p className="lbl mb-2">{u.yourSector}</p>
        <div role="radiogroup" aria-label={u.yourSector} className="flex flex-wrap gap-2">
          {SECTORS.map((s) => {
            const Icon = ICON[s.id];
            const on = sector === s.id;
            return (
              <button
                key={s.id}
                role="radio"
                aria-checked={on}
                title={s.hint[lang]}
                onClick={() => setSector(s.id)}
                className={cn('inline-flex items-center gap-2 border px-3 py-2 text-[13px] transition-colors', on ? 'border-ink bg-panel2 font-medium' : 'border-line bg-panel text-muted hover:text-ink')}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                {s.label[lang]}
              </button>
            );
          })}
        </div>
      </div>

      <Card className="p-0">
        <div className="px-5 pb-3 pt-5">
          <CardTitle icon={MODULE.compliance.icon} className="mb-0">
            {u.rollTitle}
          </CardTitle>
          <p className="mt-1 pl-6 text-[13px] text-muted">{u.rulesFor(sectorLabel)}</p>
        </div>
        <ul key={sector} className="rise divide-y divide-line border-t border-line">
          {mine.map(({ reg, flagged, related }) => (
            <li key={reg.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_200px]">
              <Link href={`/compliance#${reg.id}`} className="min-w-0 underline-offset-4 hover:underline">
                <span className="block text-[13px] font-medium leading-5">{PLAIN[reg.id]?.[lang] ?? reg.short}</span>
                <span className="block text-xs leading-4 text-muted">{reg.short}</span>
              </Link>
              <span className="flex flex-col gap-1">
                <span className={cn('tabular text-right text-[13px]', flagged === 0 ? 'text-muted' : 'font-medium')}>
                  {related === 0 ? u.noRelated : flagged === 0 ? u.none : u.flagged(flagged, related)}
                </span>
                {related > 0 && (
                  <span className="flex gap-0.5" aria-hidden>
                    {Array.from({ length: related }).map((_, i) => (
                      <span key={i} className={cn('h-1 flex-1', i < flagged ? 'bg-accent' : 'bg-line')} />
                    ))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <section aria-label={u.hitsTitle}>
        <h2 className="mb-3 lbl">{u.hitsTitle}</h2>
        {withFindings.length === 0 ? (
          <Card className="flex items-center gap-3 text-[13px] text-muted">
            <CircleCheck className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {u.none}
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {withFindings.map((h) => {
              const clauses = h.signal.clauses.filter((c) => appliesTo(regById(c.reg)!, sector));
              return (
                <li key={h.signal.id} className="border border-line bg-panel">
                  <div className="grid gap-5 px-5 py-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium leading-5">{h.signal.title[lang]}</h3>
                        {h.worst && <SeverityBadge severity={h.worst} label={sevName(h.worst, lang)} />}
                      </div>
                      <p className="mt-1 text-[13px] leading-5 text-muted">{h.signal.why[lang]}</p>
                      <p className="mt-2 text-[13px] leading-5">
                        <span className="tabular font-medium">{u.findings(h.count)}</span>
                        <span className="text-muted"> · {u.seen} </span>
                        <span className="break-words font-mono text-xs text-muted">
                          {h.hosts.join(', ')}
                          {h.count > h.hosts.length ? ` ${u.seenOn}` : ''}
                        </span>
                      </p>
                      <p className="mt-3 border-l-2 border-accent pl-3 text-[13px] leading-5">
                        <span className="lbl block">{u.nextStep}</span>
                        {FIX[h.signal.id][lang]}
                      </p>
                    </div>
                    <div className="min-w-0 border-line text-[13px] leading-5 lg:border-l lg:pl-5">
                      <p className="lbl mb-1.5">{u.touches}</p>
                      <ul className="flex flex-col gap-1.5">
                        {clauses.map((c) => {
                          const reg = regById(c.reg)!;
                          return (
                            <li key={c.reg} className="grid grid-cols-[minmax(0,10fr)_minmax(0,14fr)] gap-x-3">
                              <Link href={`/compliance#${c.reg}`} className="font-medium underline-offset-4 hover:underline">
                                {PLAIN[c.reg]?.[lang] ?? reg.short}
                                <span className="block text-xs font-normal text-muted">{reg.short}</span>
                              </Link>
                              <span className="text-muted">{c.topic[lang]}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <details className="group mt-3">
                        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
                          {u.techRefs}
                        </summary>
                        <p className="mt-1.5 text-muted">
                          <span className="text-ink">ISO 27001:2022</span> {h.signal.iso.map((i) => i.id).join(', ')}
                          <span className="mx-2">·</span>
                          <span className="text-ink">NIST CSF</span> {[...new Set(h.signal.nist.map((n) => n.cat.split(' ')[0]))].join(', ')}
                        </p>
                      </details>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {clear.length > 0 && (
        <section aria-label={u.clearTitle}>
          <h2 className="mb-3 lbl">{u.clearTitle}</h2>
          <ul className="grid gap-x-8 gap-y-1.5 text-[13px] text-muted sm:grid-cols-2">
            {clear.map((h) => (
              <li key={h.signal.id} className="flex items-center gap-2">
                <CircleCheck className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {h.signal.title[lang]}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
