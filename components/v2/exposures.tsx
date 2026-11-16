'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Callout } from '@/components/ui/callout';
import { SeverityBadge } from '@/components/ui/badge';
import { Eyebrow } from '@/components/ui/card';
import { MODULE } from '@/lib/modules';
import { sevName, type Dict } from '@/lib/i18n';
import type { EmailSecurity, ExposureDTO, ExposureKind, Lang, Severity } from '@/lib/types';
import { ExploitPanel } from '@/components/v2/exploit-panel';
import { cn } from '@/lib/utils';

const KINDS: ExposureKind[] = ['takeover', 'bucket', 'code_leak', 'email'];
const SEV_RANK: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };

function ExposureRow({ e, lang, t }: { e: ExposureDTO; lang: Lang; t: Dict }) {
  const [open, setOpen] = useState(false);
  const Icon = MODULE[e.kind].icon;
  return (
    <li className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 px-5 py-3.5 text-left hover:bg-panel2 lg:grid-cols-[96px_minmax(0,1fr)_190px_auto] lg:items-center"
      >
        <SeverityBadge severity={e.severity} label={sevName(e.severity, lang)} className="mt-px justify-self-start lg:mt-0" />
        <span className="min-w-0">
          <span className="block font-medium leading-5">{e.title[lang]}</span>
          <span className="mt-0.5 block truncate font-mono text-xs leading-4 text-muted">{e.target}</span>
        </span>
        <span className="hidden items-center gap-2 text-[13px] text-muted lg:flex">
          <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{t.kindTitle[e.kind]}</span>
        </span>
        <ChevronDown className={cn('mt-0.5 size-4 shrink-0 text-muted transition-transform lg:mt-0', open && 'rotate-180')} aria-label={t.showDetails} />
      </button>
      {open && (
        <div className="grid gap-5 border-t border-line bg-panel px-5 py-5 text-[13px] leading-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            <p>{e.reasoning[lang]}</p>
            <Callout tone="fix" title={t.fix}>
              <p>{e.remediation[lang]}</p>
            </Callout>
            <div>
              <Eyebrow>{t.evidenceLabel}</Eyebrow>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere] border border-line bg-bg p-3 font-mono text-xs leading-5 text-muted">{e.evidence}</pre>
            </div>
          </div>
          <div className="min-w-0">
            <ExploitPanel
              input={{
                kind: 'exposure',
                title: e.title[lang === 'id' ? 'en' : lang],
                severity: e.severity,
                facts: [
                  `Finding type: ${e.kind}`,
                  e.hostname ? `Host: ${e.hostname}` : '',
                  e.provider ? `Provider: ${e.provider}` : '',
                  `Target checked: ${e.target}`,
                  `Evidence: ${e.evidence}`,
                  `Why it matters: ${e.reasoning.en}`,
                ].filter(Boolean),
              }}
              lang={lang}
              t={t}
            />
          </div>
        </div>
      )}
    </li>
  );
}

export function Exposures({ exposures, email, lang, t }: { exposures: ExposureDTO[]; email: EmailSecurity | null; lang: Lang; t: Dict }) {
  const [filter, setFilter] = useState<ExposureKind | 'all'>('all');
  const actionable = useMemo(() => exposures.filter((e) => e.severity !== 'Info'), [exposures]);
  const privateBuckets = exposures.filter((e) => e.kind === 'bucket' && e.severity === 'Info').length;

  const counts = useMemo(() => {
    const c = { all: actionable.length } as Record<ExposureKind | 'all', number>;
    for (const k of KINDS) c[k] = actionable.filter((e) => e.kind === k).length;
    return c;
  }, [actionable]);

  const rows = useMemo(
    () =>
      actionable
        .filter((e) => filter === 'all' || e.kind === filter)
        .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]),
    [actionable, filter],
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">{t.exposuresIntro}</p>

      <section className="border border-line bg-panel">
        <div className="flex items-center gap-x-1 overflow-x-auto border-b border-line px-3 py-2.5 [scrollbar-width:none] md:flex-wrap md:gap-y-2" role="tablist" aria-label={t.exposuresIntro}>
          {(['all', ...KINDS] as const).map((k) => {
            const active = filter === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(k)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap border px-3 text-[13px] transition-colors',
                  active ? 'border-ink bg-ink font-medium text-[var(--color-inverse)]' : 'border-transparent text-muted hover:text-ink',
                )}
              >
                {k === 'all' ? t.all : t.kindTitle[k]}
                <span className={cn('tabular text-xs', active ? 'opacity-80' : 'text-muted')}>{counts[k]}</span>
              </button>
            );
          })}
          {email && (
            <span className="ml-auto hidden gap-4 pr-2 text-xs text-muted md:flex">
              <span>
                SPF <b className="font-medium text-ink">{email.spf.policy}</b>
              </span>
              <span>
                DMARC <b className="font-medium text-ink">{email.dmarc.policy}</b>
              </span>
            </span>
          )}
        </div>

        {rows.length ? (
          <ul>
            {rows.map((e) => (
              <ExposureRow key={e.id} e={e} lang={lang} t={t} />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-[13px] text-muted">{filter === 'all' ? t.noExposures : t.kindEmpty[filter]}</p>
        )}

        {privateBuckets > 0 && (filter === 'all' || filter === 'bucket') && <p className="border-t border-line px-5 py-3 text-xs text-muted">{t.privateBuckets(privateBuckets)}</p>}
      </section>
    </div>
  );
}
