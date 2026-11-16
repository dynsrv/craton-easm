'use client';

import { ArrowUpRight, CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { SeverityBadge } from '@/components/ui/badge';
import { Callout } from '@/components/ui/callout';
import { Card, CardTitle } from '@/components/ui/card';
import { matchScan, regById, rollUp, SECTORS, UI } from '@/lib/compliance';
import { sevName } from '@/lib/i18n';
import { MODULE } from '@/lib/modules';
import { SEVERITY_RANK } from '@/lib/score';
import type { Lang, ScanDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Compliance tab. Reads the finished scan and shows which duties and controls each finding
 * type may touch. It is a lens over existing data: nothing new is collected.
 */
export function ComplianceLens({ scan, lang }: { scan: ScanDTO; lang: Lang }) {
  const u = UI[lang];
  const hits = useMemo(() => matchScan(scan), [scan]);
  const roll = useMemo(() => rollUp(hits), [hits]);
  const withFindings = hits.filter((h) => h.count > 0).sort((a, b) => (a.worst ? SEVERITY_RANK[a.worst] : 9) - (b.worst ? SEVERITY_RANK[b.worst] : 9) || b.count - a.count);
  const clear = hits.filter((h) => h.count === 0);

  return (
    <div className="flex flex-col gap-6">
      <Callout tone="info" title={u.lensTitle}>
        <p>{u.lensLead}</p>
        <Link href="/compliance" className="mt-1.5 inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:no-underline">
          {u.openGuide}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </Callout>

      <Card className="p-0">
        <div className="px-5 pb-3 pt-5">
          <CardTitle icon={MODULE.compliance.icon} className="mb-0">
            {u.rollTitle}
          </CardTitle>
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {[...roll]
            .sort((a, b) => b.flagged - a.flagged || b.related - a.related)
            .map(({ reg, flagged, related }) => (
              <li key={reg.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-5 py-3 sm:grid-cols-[132px_minmax(0,1fr)_230px]">
                <Link href={`/compliance#${reg.id}`} className="min-w-0 text-[13px] font-medium underline-offset-4 hover:underline">
                  {reg.short}
                </Link>
                <span className="order-last col-span-2 truncate text-[13px] text-muted sm:order-none sm:col-span-1">
                  {reg.sectors.map((s) => SECTORS.find((x) => x.id === s)?.label[lang]).join(', ')}
                </span>
                <span className={cn('tabular text-right text-[13px]', flagged === 0 ? 'text-muted' : 'font-medium')}>
                  {related === 0 ? '–' : flagged === 0 ? u.none : u.flagged(flagged, related)}
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
            {withFindings.map((h) => (
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
                      <span className="break-words font-mono text-xs text-muted">{h.hosts.join(', ')}{h.count > h.hosts.length ? ` ${u.seenOn}` : ''}</span>
                    </p>
                  </div>
                  <div className="min-w-0 border-line text-[13px] leading-5 lg:border-l lg:pl-5">
                    <p className="lbl mb-1.5">{u.touches}</p>
                    <ul className="flex flex-col gap-1">
                      {h.signal.clauses.map((c) => {
                        const reg = regById(c.reg);
                        return (
                          <li key={c.reg} className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3">
                            <Link href={`/compliance#${c.reg}`} className="font-medium underline-offset-4 hover:underline">
                              {reg?.short}
                            </Link>
                            <span className="text-muted">{c.topic[lang]}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 text-muted">
                      <span className="text-ink">ISO 27001:2022</span> {h.signal.iso.map((i) => i.id).join(', ')}
                      <span className="mx-2">·</span>
                      <span className="text-ink">NIST CSF</span> {[...new Set(h.signal.nist.map((n) => n.cat.split(' ')[0]))].join(', ')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
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
