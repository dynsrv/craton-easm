'use client';

import { ArrowUpRight, ExternalLink, Scale, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Wordmark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { ThemeToggle } from '@/components/theme-toggle';
import { TopBar } from '@/components/top-bar';
import { Callout } from '@/components/ui/callout';
import { REGULATIONS, REVIEWED, SECTORS, SIGNALS, STANDARDS, UI, regById, type Regulation, type Sector } from '@/lib/compliance';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

function PublicBar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1360px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Craton home" className="shrink-0">
          <Wordmark compact />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle />
          <Link href="/login" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-[13px] text-muted hover:bg-panel2 hover:text-ink">
            {UI[lang].signIn}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

function RegCard({ r, lang }: { r: Regulation; lang: Lang }) {
  const u = UI[lang];
  const related = SIGNALS.filter((s) => s.clauses.some((c) => c.reg === r.id));
  return (
    <article id={r.id} className="scroll-mt-20 border border-line bg-panel">
      <header className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold">{r.short}</h3>
          <span className="lbl">{u.type[r.type]}</span>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-muted">{r.title[lang]}</p>
        <p className="mt-1 text-xs text-muted">
          {r.issuer} · {r.dated[lang]}
        </p>
      </header>
      <div className="flex flex-col gap-4 px-5 py-4 text-[13px] leading-5">
        <p className="text-sm leading-6">{r.gist[lang]}</p>
        <div>
          <p className="lbl mb-1.5">{u.points}</p>
          <ul className="flex flex-col gap-1.5">
            {r.points.map((p, i) => (
              <li key={i} className="grid grid-cols-[10px_minmax(0,1fr)] gap-x-2 text-muted">
                <span aria-hidden className="mt-2 size-1 bg-muted" />
                <span>{p[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
        {r.note && (
          <Callout tone="warn">
            <p>{r.note[lang]}</p>
          </Callout>
        )}
        <div>
          <p className="lbl mb-1.5">{u.checks}</p>
          {related.length === 0 ? (
            <p className="text-muted">{u.noChecks}</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {related.map((s) => (
                <li key={s.id} className="rounded-sm border border-line px-2 py-0.5 text-xs text-muted">
                  {s.title[lang]}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="lbl mb-1.5">{u.ref}</p>
          <ul className="flex flex-col gap-1">
            {r.refs.map((x) => (
              <li key={x.url}>
                <a href={x.url} {...ext} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:no-underline">
                  {x.label}
                  <ExternalLink className="size-3 shrink-0" aria-hidden />
                </a>
                <span className="ml-2 text-xs text-muted">{x.kind === 'official' ? u.official : u.secondary}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function CompliancePage({ email }: { email: string | null }) {
  const [lang, setLang] = useLang();
  const u = UI[lang];
  const [sector, setSector] = useState<Sector | 'all'>('all');
  const regs = useMemo(() => REGULATIONS.filter((r) => sector === 'all' || r.sectors.includes('any') || r.sectors.includes(sector)), [sector]);
  const allRefs = useMemo(() => {
    const seen = new Set<string>();
    return REGULATIONS.flatMap((r) => r.refs.map((x) => ({ ...x, reg: r.short }))).filter((x) => (seen.has(x.url) ? false : seen.add(x.url)));
  }, []);

  return (
    <div>
      {email ? (
        <TopBar active="compliance" email={email}>
          <LangToggle lang={lang} setLang={setLang} />
        </TopBar>
      ) : (
        <PublicBar lang={lang} setLang={setLang} />
      )}

      <main className="mx-auto flex max-w-[1360px] flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <div>
            <p className="lbl flex items-center gap-2">
              <Scale className="size-3.5" strokeWidth={1.75} aria-hidden />
              {u.navTitle}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{u.pageTitle}</h1>
            <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-muted">{u.lead}</p>
            <p className="mt-3 text-xs text-muted">{REVIEWED[lang]}</p>
          </div>
          <Callout tone="warn" icon={TriangleAlert} className="self-start">
            <p>{u.disclaimer}</p>
          </Callout>
        </section>

        <section aria-labelledby="who">
          <h2 id="who" className="text-lg font-semibold">
            {u.whoTitle}
          </h2>
          <p className="mt-1 text-[13px] text-muted">{u.whoHint}</p>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label={u.whoTitle}>
            {[{ id: 'all' as const, label: { en: 'All', id: 'Semua' } }, ...SECTORS].map((s) => (
              <button
                key={s.id}
                aria-pressed={sector === s.id}
                onClick={() => setSector(s.id)}
                className={cn('h-8 rounded-sm border px-3 text-[13px]', sector === s.id ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:text-ink')}
              >
                {s.label[lang]}
              </button>
            ))}
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-line pt-5 sm:grid-cols-2">
            <dt className="sr-only">{u.whatsNewTitle}</dt>
            {u.whatsNew.map((w) => (
              <dd key={w.when} className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 text-[13px] leading-5">
                <span className="tabular font-medium">{w.when}</span>
                <span className="text-muted">{w.what}</span>
              </dd>
            ))}
          </dl>
        </section>

        <section aria-labelledby="regs">
          <h2 id="regs" className="mb-4 text-lg font-semibold">
            {u.regsTitle} <span className="tabular text-muted">{regs.length}</span>
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {regs.map((r) => (
              <RegCard key={r.id} r={r} lang={lang} />
            ))}
          </div>
        </section>

        <section aria-labelledby="matrix">
          <h2 id="matrix" className="text-lg font-semibold">
            {u.matrixTitle}
          </h2>
          <p className="mt-1 max-w-[80ch] text-[13px] leading-5 text-muted">{u.matrixLead}</p>
          <div className="mt-4 overflow-x-auto border border-line bg-panel">
            <table className="w-full min-w-[820px] border-collapse text-left text-[13px] leading-5">
              <thead>
                <tr className="border-b border-line">
                  {[u.colFinding, u.colRegs, u.colIso, u.colNist].map((h) => (
                    <th key={h} scope="col" className="lbl px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {SIGNALS.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="w-[26%] px-4 py-3 font-medium">
                      {s.title[lang]}
                    </th>
                    <td className="w-[30%] px-4 py-3">
                      <ul className="flex flex-col gap-0.5">
                        {s.clauses.map((c) => (
                          <li key={c.reg}>
                            <a href={`#${c.reg}`} className="font-medium underline-offset-4 hover:underline">
                              {regById(c.reg)?.short}
                            </a>
                            <span className="text-muted"> · {c.topic[lang]}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="w-[22%] px-4 py-3 text-muted">
                      {s.iso.map((i) => (
                        <p key={i.id}>
                          <span className="tabular text-ink">{i.id}</span> {i.name}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.nist.map((n) => (
                        <p key={n.cat}>
                          <span className="text-ink">{n.fn}</span> · {n.cat}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
            {[STANDARDS.iso, STANDARDS.nist].map((s) => (
              <a key={s.url} href={s.url} {...ext} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:no-underline">
                {s.short}: {s.title[lang]}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            ))}
          </p>
        </section>

        <section aria-labelledby="incident" className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
          <h2 id="incident" className="text-lg font-semibold">
            {u.incidentTitle}
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {u.incident.map((i) => (
              <li key={i.who} className="grid gap-x-6 gap-y-0.5 py-3 text-[13px] leading-5 sm:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                <span className="font-medium">{i.who}</span>
                <span className="text-muted">{i.what}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="limits" className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
          <h2 id="limits" className="text-lg font-semibold">
            {u.limitsTitle}
          </h2>
          <ul className="flex flex-col gap-2 text-[13px] leading-5 text-muted">
            {u.limits.map((l) => (
              <li key={l} className="grid grid-cols-[10px_minmax(0,1fr)] gap-x-2">
                <span aria-hidden className="mt-2 size-1 bg-muted" />
                {l}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sources" className="border-t border-line pt-8">
          <h2 id="sources" className="mb-3 text-lg font-semibold">
            {u.sourcesTitle}
          </h2>
          <ul className="grid gap-x-8 gap-y-1.5 text-[13px] sm:grid-cols-2">
            {allRefs.map((x) => (
              <li key={x.url} className="min-w-0">
                <a href={x.url} {...ext} className="inline-flex max-w-full items-center gap-1.5 underline underline-offset-4 hover:no-underline">
                  <span className="truncate">
                    {x.reg} · {x.label}
                  </span>
                  <ExternalLink className="size-3 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
