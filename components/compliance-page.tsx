'use client';

import { useSector } from '@/components/use-sector';
import { ArrowUpRight, Banknote, Building2, Check, CreditCard, ExternalLink, Factory, Landmark, Scale, TriangleAlert, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NIGHT, SiteFooter, SiteHeader } from '@/components/site-chrome';
import { NumBadge } from '@/components/ui/num-badge';
import { Wordmark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { TopBar } from '@/components/top-bar';
import { appliesTo, PLAIN, REGULATIONS, REVIEWED, SECTORS, SIGNALS, STANDARDS, UI, regById, type Regulation, type Sector } from '@/lib/compliance';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const SECTOR_ICON: Record<Sector, LucideIcon> = { any: Building2, bank: Landmark, payments: CreditCard, finance: Banknote, cii: Factory };

/** One shell for every section, so the page lines up with the top bar and with itself. */
const APP_SHELL = 'mx-auto w-full max-w-[1360px] px-4 sm:px-6';
/** Signed-out visitors get the landing page's width so both pages line up. */
const PUBLIC_SHELL = 'mx-auto w-full max-w-[1280px] px-5 sm:px-8';
const ShellCtx = createContext(APP_SHELL);

function Section({ id, className, children, first, ...rest }: { id: string; className?: string; children: React.ReactNode; first?: boolean } & React.AriaAttributes) {
  const SHELL = useContext(ShellCtx);
  return (
    <section id={id} className={cn('scroll-mt-28', !first && 'border-t border-line')} {...rest}>
      <div className={cn(SHELL, 'py-12 sm:py-16', className)}>{children}</div>
    </section>
  );
}

/** Same pattern as the landing page: a small labelled eyebrow over a large tight heading and a muted lead. */
function SectionHead({ label, title, lead, children }: { label?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      {label && <p className="lbl">{label}</p>}
      <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[36px]">{title}</h2>
      {(lead || children) && <div className="mt-1 max-w-[72ch] text-[15px] leading-6 text-muted">{lead ?? children}</div>}
    </div>
  );
}

function Reader({ r, lang, applies }: { r: Regulation; lang: Lang; applies: boolean }) {
  const u = UI[lang];
  const related = SIGNALS.filter((s) => s.clauses.some((c) => c.reg === r.id));
  return (
    <article key={r.id} className="rise flex min-h-full flex-col border border-line bg-panel">
      <header className="border-b border-line px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="text-2xl font-semibold tracking-[-0.02em]">{r.short}</h3>
          <span className="rounded-sm border border-line px-2 py-0.5 text-xs text-muted">{u.type[r.type]}</span>
          {!applies && <span className="rounded-sm border border-line px-2 py-0.5 text-xs text-muted">{u.dimNote}</span>}
        </div>
        <p className="mt-2 text-[13px] leading-5 text-muted">{r.title[lang]}</p>
        <p className="mt-1 text-xs text-muted">
          {r.issuer} · {r.dated[lang]}
        </p>
      </header>

      <div className="grid flex-1 gap-8 px-6 py-6 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="text-lg font-medium leading-7 tracking-[-0.01em]">{r.gist[lang]}</p>
          <div>
            <p className="lbl mb-3">{u.points}</p>
            <ol className="flex flex-col divide-y divide-line border-y border-line">
              {r.points.map((p, i) => (
                <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-x-3.5 py-3 text-[13px] leading-5">
                  <NumBadge n={i + 1} />
                  <span className="pt-1">{p[lang]}</span>
                </li>
              ))}
            </ol>
          </div>
          {r.note && (
            <p className="flex gap-2.5 text-[13px] leading-5 text-muted">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {r.note[lang]}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6 xl:border-l xl:border-line xl:pl-8">
          <div>
            <p className="lbl mb-3">{u.checks}</p>
            {related.length === 0 ? (
              <p className="text-[13px] leading-5 text-muted">{u.noChecks}</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {related.map((s) => (
                  <li key={s.id}>
                    <a href="#map" className="inline-flex min-h-7 items-center border border-line px-2 py-1 text-xs leading-4 hover:border-muted">
                      {s.title[lang]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="lbl mb-3">{u.ref}</p>
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {r.refs.map((x) => (
                <li key={x.url}>
                  <a href={x.url} {...ext} className="flex items-center gap-3 py-2.5 text-[13px] hover:bg-panel2">
                    <span className="min-w-0 flex-1 truncate">{x.label}</span>
                    <span className="shrink-0 text-xs text-muted">{x.kind === 'official' ? u.official : u.secondary}</span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CompliancePage({ email, isAdmin = false }: { email: string | null; isAdmin?: boolean }) {
  const [lang, setLang] = useLang();
  const u = UI[lang];
  // Signed-out visitors see the dark theme and have no switch; on leaving, the saved or system theme returns.
  useEffect(() => {
    if (email) return;
    const root = document.documentElement;
    root.dataset.theme = 'dark';
    return () => {
      let t: string | null = null;
      try {
        t = localStorage.getItem('craton-theme');
      } catch {}
      if (t !== 'light' && t !== 'dark') t = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      root.dataset.theme = t;
    };
  }, [email]);
  const [sector, setSector] = useSector();
  const [selected, setSelected] = useState<string>('uu-pdp');
  const [days, setDays] = useState<Record<string, number>>({});

  const counts = useMemo(() => Object.fromEntries(SECTORS.map((s) => [s.id, REGULATIONS.filter((r) => appliesTo(r, s.id)).length])) as Record<Sector, number>, []);
  const mine = useMemo(() => REGULATIONS.filter((r) => appliesTo(r, sector)), [sector]);
  const others = useMemo(() => REGULATIONS.filter((r) => !appliesTo(r, sector)), [sector]);
  const sectorLabel = SECTORS.find((s) => s.id === sector)!.label[lang];
  const current = regById(selected) ?? mine[0];
  const allRefs = useMemo(() => {
    const seen = new Set<string>();
    return REGULATIONS.flatMap((r) => r.refs.map((x) => ({ ...x, reg: r.short }))).filter((x) => (seen.has(x.url) ? false : seen.add(x.url)));
  }, []);

  const pickSector = useCallback((s: Sector) => {
    setSector(s);
    // Keep the open rule if it still applies, otherwise move to the first one that does.
    setSelected((cur) => {
      const r = regById(cur);
      return r && appliesTo(r, s) ? cur : REGULATIONS.find((x) => appliesTo(x, s))!.id;
    });
  }, []);

  const openRule = useCallback((id: string, scroll = true) => {
    setSelected(id);
    if (scroll) document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Deep links from the scan tab (/compliance#uu-pdp) open that rule.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (regById(id)) {
      setSelected(id);
      setTimeout(() => document.getElementById('rules')?.scrollIntoView({ block: 'start' }), 0);
    }
  }, []);

  // Day counts depend on today's date, so they are filled in after the page loads.
  useEffect(() => {
    setDays(Object.fromEntries(u.whatsNew.map((w) => [w.iso, Math.ceil((Date.parse(w.iso) - Date.now()) / 86_400_000)])));
  }, [u.whatsNew]);

  const SHELL = email ? APP_SHELL : PUBLIC_SHELL;
  return (
    <ShellCtx.Provider value={SHELL}>
    <div style={email ? undefined : NIGHT} className={cn(!email && 'min-h-dvh bg-bg text-ink antialiased')}>
      {email ? (
        <TopBar active="compliance" email={email} isAdmin={isAdmin}>
          <LangToggle lang={lang} setLang={setLang} />
        </TopBar>
      ) : (
        <SiteHeader lang={lang} setLang={setLang} active="compliance" />
      )}

      {/* Hero */}
      <header className={cn(SHELL, 'pb-12 sm:pb-16', email ? 'pt-10 sm:pt-16' : 'pt-24 sm:pt-28')}>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2.5 text-[15px] font-medium text-muted">
              <Scale className="size-4" strokeWidth={1.75} aria-hidden />
              {u.navTitle}
            </p>
            <h1 className="mt-5 max-w-[16ch] text-[40px] font-semibold leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[72px]">{u.pageTitle}</h1>
            <p className="mt-6 max-w-[60ch] text-[17px] leading-7 text-muted">{u.lead}</p>
            <p className="mt-4 text-xs text-muted">{REVIEWED[lang]}</p>
          </div>
          <dl className="grid grid-cols-3 border border-line bg-panel">
            {[
              { n: REGULATIONS.length + 2, l: u.statRules },
              { n: SECTORS.length, l: u.statSectors },
              { n: SIGNALS.length, l: u.statChecks },
            ].map((s, i) => (
              <div key={s.l} className={cn('flex flex-col justify-between gap-6 p-4 sm:p-5', i > 0 && 'border-l border-line')}>
                <dd className="tabular order-first text-[40px] font-semibold leading-none tracking-[-0.03em] sm:text-[56px]">{s.n}</dd>
                <dt className="text-[13px] leading-4 text-muted">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-10 flex gap-3 border-y border-line py-3 text-[13px] leading-5 text-muted">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {u.disclaimer}
        </p>
      </header>

      {/* In-page navigation */}
      <nav aria-label={u.navTitle} className="no-print z-20 border-y border-line bg-bg/90 backdrop-blur-md lg:sticky" style={{ top: email ? 48 : 56 }}>
        <ul className={cn(SHELL, 'flex gap-1 overflow-x-auto')}>
          {(Object.keys(u.subnav) as (keyof typeof u.subnav)[]).map((k) => (
            <li key={k} className="shrink-0">
              <a href={`#${k === 'rules' ? 'who' : k === 'incidents' ? 'incident' : k}`} className="flex h-11 items-center px-3 text-[13px] text-muted hover:text-ink">
                {u.subnav[k]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {/* 1. Who are you */}
        <Section id="who" first>
          <SectionHead label={u.subnav.rules} title={u.whoTitle} lead={u.rulesLead} />
          <div role="radiogroup" aria-label={u.whoTitle} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SECTORS.map((s) => {
              const Icon = SECTOR_ICON[s.id];
              const on = sector === s.id;
              return (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickSector(s.id)}
                  className={cn('group flex min-h-[176px] flex-col border p-4 text-left transition-colors', on ? 'border-ink bg-panel2' : 'border-line bg-panel hover:border-muted')}
                >
                  <span className="flex items-start justify-between">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                    <span className={cn('grid size-5 place-items-center border', on ? 'border-ink bg-ink text-bg' : 'border-line text-transparent')}>
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                  </span>
                  <span className="mt-4 text-base font-semibold leading-5">{s.label[lang]}</span>
                  <span className="mt-1 text-[13px] leading-5 text-muted">{s.hint[lang]}</span>
                  <span className="tabular mt-auto pt-4 text-[13px] font-medium">{u.tileRules(counts[s.id])}</span>
                </button>
              );
            })}
          </div>

          <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            <dt className="sr-only">{u.keyDatesTitle}</dt>
            {u.whatsNew.map((w) => {
              const d = days[w.iso];
              return (
                <dd key={w.iso} className="grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-x-4 bg-panel px-5 py-4 text-[13px] leading-5">
                  <span>
                    <span className="tabular block text-base font-semibold tracking-[-0.01em]">{w.when}</span>
                    <span className="tabular block text-xs text-muted">{d === undefined ? ' ' : d > 0 ? u.inDays(d) : u.inForce}</span>
                  </span>
                  <span className="text-muted">{w.what}</span>
                </dd>
              );
            })}
          </dl>
        </Section>

        {/* 2. The rulebook: list on the left, reader on the right */}
        <Section id="rules" aria-live="polite">
          <SectionHead label={u.rulebook} title={u.appliesSummary(mine.length, sectorLabel)} />
          <div className="grid gap-4 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-6">
            <div key={sector} className="rise min-w-0">
              <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
                <li className="hidden pb-2 pl-3.5 pr-3 lg:block">
                  <p className="lbl">{u.appliesToYou}</p>
                </li>
                {mine.map((r) => (
                  <RailItem key={r.id} r={r} on={current?.id === r.id} lang={lang} onPick={() => openRule(r.id, false)} />
                ))}
                {others.length > 0 && (
                  <li className="hidden pb-2 pl-3.5 pr-3 pt-6 lg:block">
                    <p className="lbl">{u.otherRules}</p>
                  </li>
                )}
                {others.map((r) => (
                  <RailItem key={r.id} r={r} on={current?.id === r.id} lang={lang} dim onPick={() => openRule(r.id, false)} />
                ))}
              </ul>
            </div>
            <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">{current && <Reader r={current} lang={lang} applies={appliesTo(current, sector)} />}</div>
          </div>
        </Section>

        {/* 3. Finding map */}
        <Section id="map">
          <SectionHead label={u.subnav.map} title={u.matrixTitle} lead={u.matrixLead} />
          <p className="mb-3 text-xs text-muted">{u.mapHint}</p>
          <div className="border border-line bg-panel">
            <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)] gap-x-6 border-b border-line px-5 py-3 lg:grid">
              {[u.colFinding, u.colRegs, u.colIso, u.colNist].map((h) => (
                <span key={h} className="lbl">
                  {h}
                </span>
              ))}
            </div>
            <ul className="divide-y divide-line">
              {SIGNALS.map((s) => (
                <li key={s.id} className="grid gap-x-6 gap-y-3 px-5 py-4 text-[13px] leading-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)]">
                  <div>
                    <p className="font-medium">{s.title[lang]}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{s.why[lang]}</p>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {s.clauses.map((c) => {
                      const reg = regById(c.reg)!;
                      const on = appliesTo(reg, sector);
                      return (
                        <li key={c.reg} className={cn('grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 transition-opacity', !on && 'opacity-40')}>
                          <button onClick={() => openRule(c.reg)} className="text-left font-medium underline-offset-4 hover:underline">
                            {reg.short}
                          </button>
                          <span className="text-muted">{c.topic[lang]}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <ul className="flex flex-col gap-0.5 text-muted">
                    {s.iso.map((i) => (
                      <li key={i.id}>
                        <span className="tabular text-ink">{i.id}</span> {i.name}
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-col gap-0.5 text-muted">
                    {s.nist.map((n) => (
                      <li key={n.cat}>
                        <span className="text-ink">{n.fn}</span> · {n.cat}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-muted">
            {[STANDARDS.iso, STANDARDS.nist].map((s) => (
              <a key={s.url} href={s.url} {...ext} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-ink hover:no-underline">
                {s.short}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            ))}
          </p>
        </Section>

        {/* 4. Incident clocks */}
        <Section id="incident">
          <SectionHead label={u.subnav.incidents} title={u.incidentTitle} lead={u.incidentLead} />
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {u.incident.map((i) => {
              const on = i.sectors.some((x) => x === 'any' || x === sector);
              return (
                <li key={i.who} className={cn('flex flex-col bg-panel p-5 transition-opacity', !on && 'opacity-40')}>
                  <p className="tabular min-h-[2.75rem] text-2xl font-semibold leading-[1.1] tracking-[-0.02em]">{i.big}</p>
                  <p className="mt-4 text-[13px] font-medium leading-5">{i.who}</p>
                  <p className="mt-2 text-[13px] leading-5 text-muted">{i.what}</p>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* 5. Limits */}
        <Section id="limits">
          <SectionHead label={u.subnav.limits} title={u.limitsTitle} />
          <ul className="grid gap-px border border-line bg-line lg:grid-cols-3">
            {u.limits.map((l, i) => (
              <li key={l} className="bg-panel p-5 text-[13px] leading-5 text-muted">
                <NumBadge n={i + 1} className="mb-4" />
                {l}
              </li>
            ))}
          </ul>
        </Section>

        {/* 6. Sources */}
        <Section id="sources" className="pb-20 sm:pb-24">
          <SectionHead label={u.subnav.sources} title={u.sourcesTitle} lead={u.sourcesCount(allRefs.length)} />
          <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
            {allRefs.map((x) => (
              <li key={x.url} className="border-b border-line">
                <a href={x.url} {...ext} className="flex items-center gap-3 py-2.5 text-[13px] hover:text-ink">
                  <span className="w-[112px] shrink-0 font-medium">{x.reg}</span>
                  <span className="min-w-0 flex-1 truncate text-muted">{x.label}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>
      <SiteFooter lang={lang} inner={email ? undefined : 'max-w-[1280px]'} />
    </div>
    </ShellCtx.Provider>
  );
}

function RailItem({ r, on, dim, lang, onPick }: { r: Regulation; on: boolean; dim?: boolean; lang: Lang; onPick: () => void }) {
  const u = UI[lang];
  return (
    <li className="shrink-0 lg:shrink">
      <button
        onClick={onPick}
        aria-current={on ? 'true' : undefined}
        className={cn(
          'flex h-full w-full flex-col items-start gap-0.5 border-b-2 px-3 py-2.5 text-left transition-colors lg:border-b-0 lg:border-l-2',
          on ? 'border-ink bg-panel2' : 'border-transparent hover:bg-panel',
          dim && !on && 'opacity-50 hover:opacity-100',
        )}
      >
        <span className="whitespace-nowrap text-[13px] font-medium leading-5">{r.short}</span>
        <span className="hidden text-xs leading-4 text-muted lg:block">{PLAIN[r.id]?.[lang] ?? u.type[r.type]}</span>
      </button>
    </li>
  );
}
