'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SEV_VAR } from '@/lib/i18n';
import { grade } from '@/lib/score';
import type { Lang, ScanListItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const COPY = {
  en: { open: 'Scan history', search: 'Search domain or date', scans: (n: number) => `${n} ${n === 1 ? 'scan' : 'scans'}`, none: 'No scan matches that search.', current: 'Viewing' },
  id: { open: 'Riwayat scan', search: 'Cari domain atau tanggal', scans: (n: number) => `${n} scan`, none: 'Tidak ada scan yang cocok.', current: 'Dilihat' },
} as const;

/**
 * The domain name is the entry to every past scan: one searchable list grouped by domain, with date,
 * score and the change since the previous scan of that domain. Replaces the old date drop-down.
 */
export function ScanHistory({
  recent,
  currentId,
  domain,
  lang,
  dateFmt,
  dateLabel,
  onPick,
  variant = 'hero',
}: {
  recent: ScanListItem[];
  currentId: string;
  domain: string;
  lang: Lang;
  dateFmt: (iso: string) => string;
  dateLabel?: string;
  onPick: (id: string) => void;
  variant?: 'hero' | 'compact';
}) {
  const c = COPY[lang];
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const multi = recent.length > 1;

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const groups = useMemo(() => {
    const done = recent.filter((r) => r.status === 'completed' || r.id === currentId);
    const byDomain = new Map<string, ScanListItem[]>();
    for (const r of [...done].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))) byDomain.set(r.domain, [...(byDomain.get(r.domain) ?? []), r]);
    const needle = q.trim().toLowerCase();
    return [...byDomain.entries()]
      .sort(([a], [b]) => (a === domain ? -1 : b === domain ? 1 : 0))
      .map(([d, rows]) => ({
        domain: d,
        total: rows.length,
        rows: rows
          .map((r, i) => ({ r, delta: r.score != null && rows[i + 1]?.score != null ? r.score - (rows[i + 1].score as number) : null }))
          .filter(({ r }) => !needle || d.toLowerCase().includes(needle) || dateFmt(r.createdAt).toLowerCase().includes(needle)),
      }))
      .filter((g) => g.rows.length > 0);
  }, [recent, q, domain, currentId, dateFmt]);

  const mark = variant === 'hero' ? 'domain-mark text-[32px] font-semibold leading-10 tracking-[-0.025em]' : 'domain-mark text-sm font-semibold';

  if (!multi) {
    return variant === 'hero' ? (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="[overflow-wrap:anywhere] text-[32px] font-semibold leading-10 tracking-[-0.025em]">
          <span className="domain-mark">{domain}</span>
        </h1>
        {dateLabel && <span className="inline-flex h-7 items-center rounded-md bg-panel2 px-2.5 text-xs text-muted">{dateLabel}</span>}
      </div>
    ) : (
      <span className="domain-mark text-sm font-semibold">{domain}</span>
    );
  }

  const trigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${c.open}: ${domain}`}
      onClick={() => setOpen((o) => !o)}
      className="inline-flex max-w-full items-center gap-2 text-left"
    >
      {variant === 'hero' ? (
        <h1 className="[overflow-wrap:anywhere]">
          <span className={mark}>{domain}</span>
        </h1>
      ) : (
        <span className={mark}>{domain}</span>
      )}
      <ChevronDown className={cn('shrink-0 text-muted transition-transform', variant === 'hero' ? 'size-5' : 'size-3.5', open && 'rotate-180')} aria-hidden />
    </button>
  );

  return (
    <div ref={root} className="relative">
      {variant === 'hero' ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {trigger}
          {dateLabel && <span className="inline-flex h-7 items-center rounded-md bg-panel2 px-2.5 text-xs text-muted">{dateLabel}</span>}
        </div>
      ) : (
        trigger
      )}

      {open && (
        <div role="dialog" aria-label={c.open} className="absolute left-0 top-full z-30 mt-2 w-[min(540px,calc(100vw-2rem))] border border-line bg-panel shadow-2xl">
          <div className="flex h-11 items-center gap-2.5 border-b border-line px-3.5">
            <Search className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
            <label htmlFor="scan-history-q" className="sr-only">
              {c.search}
            </label>
            <input id="scan-history-q" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.search} autoComplete="off" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          </div>
          <div className="max-h-[360px] overflow-y-auto pb-2">
            {groups.length === 0 && <p className="px-3.5 py-6 text-[13px] text-muted">{c.none}</p>}
            {groups.map((g) => (
              <div key={g.domain}>
                <div className="flex items-baseline justify-between px-3.5 pb-1.5 pt-3">
                  <span className="text-[13px] font-medium">{g.domain}</span>
                  <span className="text-xs text-muted">{c.scans(g.total)}</span>
                </div>
                <ul>
                  {g.rows.map(({ r, delta }) => {
                    const cur = r.id === currentId;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          aria-current={cur ? 'true' : undefined}
                          onClick={() => {
                            setOpen(false);
                            if (!cur) onPick(r.id);
                          }}
                          className={cn('grid h-10 w-full grid-cols-[12px_minmax(0,1fr)_72px_44px_16px] items-center gap-3 px-3.5 text-left text-[13px] hover:bg-panel2', cur && 'bg-panel2 shadow-[inset_2px_0_0_var(--color-accent)]')}
                        >
                          <span className="size-2 rounded-full" style={{ background: r.score != null ? SEV_VAR[grade(r.score).severity] : 'var(--color-line)' }} aria-hidden />
                          <span>{dateFmt(r.createdAt)}</span>
                          <span className="tabular font-mono">
                            {r.score ?? '–'}
                            <span className="text-muted"> /100</span>
                          </span>
                          <span className={cn('tabular', delta != null && delta > 0 ? 'text-ok' : 'text-crit')}>{delta ? `${delta > 0 ? '+' : '−'}${Math.abs(delta)}` : ''}</span>
                          <span aria-label={cur ? c.current : undefined}>{cur && <Check className="size-4 text-accent" aria-hidden />}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
