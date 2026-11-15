'use client';

import { Cloud, Code2, Link2Off, Mail } from 'lucide-react';
import { useState } from 'react';
import { SeverityBadge } from '@/components/ui/badge';
import { Card, Eyebrow } from '@/components/ui/card';
import { sevName, SEV_VAR, type Dict } from '@/lib/i18n';
import type { EmailSecurity, ExposureDTO, ExposureKind, Lang } from '@/lib/types';

const ICON: Record<ExposureKind, React.ComponentType<{ className?: string }>> = { takeover: Link2Off, bucket: Cloud, code_leak: Code2, email: Mail };
const ORDER: ExposureKind[] = ['takeover', 'bucket', 'code_leak', 'email'];

function ExposureRow({ e, lang, t }: { e: ExposureDTO; lang: Lang; t: Dict }) {
  const [open, setOpen] = useState(e.severity === 'Critical');
  return (
    <li className="border-b border-line py-3.5 last:border-b-0" style={{ boxShadow: `inset 3px 0 0 ${SEV_VAR[e.severity]}` }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-start gap-3 pl-4 pr-1 text-left">
        <SeverityBadge severity={e.severity} label={sevName(e.severity, lang)} className="mt-px" />
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-5">{e.title[lang]}</span>
          <span className="mt-0.5 block break-all font-mono text-xs leading-4 text-muted">{e.target}</span>
        </span>
        <span className="shrink-0 pt-0.5 text-xs text-accent">{t.showDetails}</span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3 pl-4 pr-1 text-[13px] leading-5">
          <p>{e.reasoning[lang]}</p>
          <div className="rounded-md border border-line bg-bg p-3" style={{ boxShadow: 'inset 3px 0 0 var(--color-low)' }}>
            <Eyebrow>{t.fix}</Eyebrow>
            <p>{e.remediation[lang]}</p>
          </div>
          <div>
            <Eyebrow>{t.evidenceLabel}</Eyebrow>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md border border-line bg-bg p-3 font-mono text-xs leading-5 text-muted">{e.evidence}</pre>
          </div>
        </div>
      )}
    </li>
  );
}

export function Exposures({ exposures, email, lang, t }: { exposures: ExposureDTO[]; email: EmailSecurity | null; lang: Lang; t: Dict }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-[80ch] text-muted">{t.exposuresIntro}</p>
      <div className="grid gap-5 xl:grid-cols-2">
        {ORDER.map((kind) => {
          const Icon = ICON[kind];
          const items = exposures.filter((e) => e.kind === kind && e.severity !== 'Info');
          const privateBuckets = kind === 'bucket' ? exposures.filter((e) => e.kind === 'bucket' && e.severity === 'Info').length : 0;
          return (
            <Card key={kind} className="flex flex-col p-0">
              <header className="flex items-center gap-2.5 px-5 pb-3 pt-5">
                <Icon className="size-4 text-muted" aria-hidden />
                <h2 className="text-sm font-semibold">{t.kindTitle[kind]}</h2>
                <span className="tabular text-muted">{items.length}</span>
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

/** Compact counts for the overview tab. */
export function ExposureStrip({ exposures, email, lang, t, onOpen }: { exposures: ExposureDTO[]; email: EmailSecurity | null; lang: Lang; t: Dict; onOpen: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <h2 className="text-sm font-semibold">{t.exposureStrip}</h2>
        {ORDER.map((kind) => {
          const Icon = ICON[kind];
          const items = exposures.filter((e) => e.kind === kind && e.severity !== 'Info');
          const worst = items[0]?.severity;
          return (
            <button key={kind} onClick={onOpen} className="flex items-center gap-2 text-[13px] hover:text-accent">
              <Icon className="size-4 text-muted" aria-hidden />
              {t.kindTitle[kind]}
              <b className="tabular font-semibold" style={{ color: worst ? SEV_VAR[worst] : 'var(--color-muted)' }}>
                {kind === 'email' && email && !items.length ? '✓' : items.length}
              </b>
            </button>
          );
        })}
        <button onClick={onOpen} className="ml-auto text-[13px] text-accent hover:underline">
          {t.viewAll}
        </button>
      </div>
      <span className="sr-only">{lang}</span>
    </Card>
  );
}
