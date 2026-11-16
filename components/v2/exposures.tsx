'use client';

import { ChevronDown } from 'lucide-react';
import { Callout } from '@/components/ui/callout';
import { IconTile } from '@/components/ui/icon-tile';
import { MODULE } from '@/lib/modules';
import { useState } from 'react';
import { SeverityBadge } from '@/components/ui/badge';
import { Card, Eyebrow } from '@/components/ui/card';
import { sevName, type Dict } from '@/lib/i18n';
import type { EmailSecurity, ExposureDTO, ExposureKind, Lang } from '@/lib/types';

const ORDER: ExposureKind[] = ['takeover', 'bucket', 'code_leak', 'email'];

function ExposureRow({ e, lang, t }: { e: ExposureDTO; lang: Lang; t: Dict }) {
  const [open, setOpen] = useState(e.severity === 'Critical');
  return (
    <li className="border-b border-line last:border-b-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-start gap-3 px-5 py-3.5 text-left hover:bg-panel2">
        <SeverityBadge severity={e.severity} label={sevName(e.severity, lang)} className="mt-px" />
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-5">{e.title[lang]}</span>
          <span className="mt-0.5 block [overflow-wrap:anywhere] font-mono text-xs leading-4 text-muted">{e.target}</span>
        </span>
        <ChevronDown className={`mt-0.5 size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-label={t.showDetails} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-5 pb-4 text-[13px] leading-5">
          <p>{e.reasoning[lang]}</p>
          <Callout tone="fix" title={t.fix}>
            <p>{e.remediation[lang]}</p>
          </Callout>
          <div>
            <Eyebrow>{t.evidenceLabel}</Eyebrow>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere] rounded-md border border-line bg-bg p-3 font-mono text-xs leading-5 text-muted">{e.evidence}</pre>
          </div>
        </div>
      )}
    </li>
  );
}

export function Exposures({ exposures, email, lang, t }: { exposures: ExposureDTO[]; email: EmailSecurity | null; lang: Lang; t: Dict }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">{t.exposuresIntro}</p>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        {ORDER.map((kind) => {
          const items = exposures.filter((e) => e.kind === kind && e.severity !== 'Info');
          const privateBuckets = kind === 'bucket' ? exposures.filter((e) => e.kind === 'bucket' && e.severity === 'Info').length : 0;
          return (
            <Card key={kind} className="flex flex-col p-0">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 pb-4 pt-5">
                <IconTile icon={MODULE[kind].icon} tone={MODULE[kind].tone} />
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{t.kindTitle[kind]}</h2>
                <span className="tabular rounded-sm bg-panel2 px-1.5 text-xs font-medium text-muted">{items.length}</span>
                {kind === 'email' && email && (
                  <span className="ml-auto flex gap-3 text-xs text-muted">
                    <span>
                      SPF <b className="font-medium text-ink">{email.spf.policy}</b>
                    </span>
                    <span>
                      DMARC <b className="font-medium text-ink">{email.dmarc.policy}</b>
                    </span>
                  </span>
                )}
              </header>
              {items.length ? (
                <ul className="border-t border-line">
                  {items.map((e) => (
                    <ExposureRow key={e.id} e={e} lang={lang} t={t} />
                  ))}
                </ul>
              ) : (
                <p className="border-t border-line px-5 py-6 text-[13px] text-muted">{t.kindEmpty[kind]}</p>
              )}
              {privateBuckets > 0 && <p className="border-t border-line px-5 py-3 text-xs text-muted">{t.privateBuckets(privateBuckets)}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

