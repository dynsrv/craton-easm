'use client';

import { BellRing, History } from 'lucide-react';
import { SeverityDot } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { sevName, SEV_VAR, type Dict } from '@/lib/i18n';
import type { DriftEventDTO, Lang } from '@/lib/types';

export function DriftTimeline({ events, baselineScanId, lang, t }: { events: DriftEventDTO[]; baselineScanId: string | null; lang: Lang; t: Dict }) {
  const fmt = (iso: string) => new Date(iso).toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // group by the scan that detected the change, newest first
  const groups = new Map<string, DriftEventDTO[]>();
  for (const e of events) groups.set(e.scanId, [...(groups.get(e.scanId) ?? []), e]);

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-[80ch] text-muted">{t.driftIntro}</p>
      {!baselineScanId && events.length === 0 && <Card className="py-12 text-center text-muted">{t.driftBaseline}</Card>}
      {baselineScanId && events.length === 0 && <Card className="py-12 text-center text-muted">{t.driftEmpty}</Card>}

      {groups.size > 0 && (
        <Card>
          <ol className="relative ml-3 flex flex-col gap-8 border-l border-line pl-7">
            {[...groups.entries()].map(([scanId, list]) => (
              <li key={scanId} className="relative">
                <span className="absolute -left-[41px] -top-0.5 grid size-6 place-items-center rounded-full border border-line bg-panel" aria-hidden>
                  <History className="size-3.5 text-muted" strokeWidth={1.75} />
                </span>
                <p className="text-[13px] font-semibold leading-5">{fmt(list[0].createdAt)}</p>
                <p className="text-xs text-muted">
                  {list.length} {lang === 'id' ? 'perubahan' : list.length === 1 ? 'change' : 'changes'} · {t.comparedWith.toLowerCase()}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {list.map((e) => (
                    <li key={e.id} className="flex flex-col gap-1.5 rounded-md border border-line bg-bg px-4 py-3 sm:flex-row sm:items-start sm:gap-3">
                      <span className="flex shrink-0 items-center justify-between gap-2 sm:w-[84px]">
                        <span className="flex items-center gap-2 text-xs font-medium" style={{ color: SEV_VAR[e.severity] }}>
                          <SeverityDot severity={e.severity} />
                          {sevName(e.severity, lang)}
                        </span>
                        {e.notifiedAt && (
                          <span className="flex items-center gap-1 text-xs text-muted sm:hidden" title={fmt(e.notifiedAt)}>
                            <BellRing className="size-3.5" aria-hidden />
                            {t.alerted}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] leading-5 [overflow-wrap:anywhere]">{e.detail[lang]}</span>
                      {e.notifiedAt && (
                        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted sm:flex" title={fmt(e.notifiedAt)}>
                          <BellRing className="size-3.5" aria-hidden />
                          {t.alerted}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
