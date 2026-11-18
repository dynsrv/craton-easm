'use client';

import { ArrowRight, ArrowUpRight, Check, Layers, Radar, Route, ScanSearch, ShieldCheck, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useLang } from '@/components/lang';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { EASM_COPY, EASM_STAGES, NIST_CSF_URL, type EasmStage } from '@/lib/easm-content';
import { cn } from '@/lib/utils';

const STAGE_ICON: Record<EasmStage, LucideIcon> = { discover: ScanSearch, classify: Layers, assess: ShieldCheck, prioritise: Route, monitor: Radar };

const btn = 'inline-flex h-11 items-center gap-3 px-5 text-[15px] font-medium transition-colors';
const h2 = 'text-[26px] font-semibold leading-8 tracking-[-0.02em] sm:text-[30px]';

function Table({ cols, rows, hi }: { cols: string[]; rows: string[][]; hi?: number }) {
  return (
    <div className="mt-6 overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-6">
        <thead>
          <tr className="border-b border-line bg-panel">
            {cols.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 text-[13px] font-medium text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} className={cn('border-b border-line last:border-b-0', hi === i && 'bg-panel')}>
              {r.map((cell, j) => (
                <td key={j} className={cn('px-4 py-3 align-top', j === 0 ? 'font-medium text-ink' : 'text-muted', hi === i && 'text-ink')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EasmPage() {
  const [lang, setLang] = useLang();
  const c = EASM_COPY[lang];

  return (
    <div className="min-h-dvh bg-bg text-ink antialiased">
      <SiteHeader lang={lang} setLang={setLang} active="easm" />
      <div className="mx-auto grid max-w-[1280px] gap-x-12 gap-y-8 px-5 pb-20 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">{c.ui.onPage}</p>
          <nav aria-label={c.ui.onPage} className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {c.toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 whitespace-nowrap border border-transparent px-3 py-2 text-[14px] leading-5 text-muted transition-colors hover:bg-panel hover:text-ink lg:whitespace-normal">
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 max-w-[860px]">
          <p className="text-[15px] font-medium text-muted">{c.kicker}</p>
          <h1 className="mt-3 max-w-[22ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">{c.h1}</h1>
          <p className="mt-6 max-w-[64ch] text-[17px] leading-8 text-muted">{c.lead}</p>

          <div className="mt-12 flex flex-col gap-14">
            {/* Definition */}
            <section id="definition" className="scroll-mt-24">
              <h2 className={h2}>{c.definition.h}</h2>
              <div className="mt-4 flex flex-col gap-4 text-[15px] leading-7 text-ink/90">
                {c.definition.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="mt-6 text-sm font-medium text-muted">{c.definition.chipsTitle}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.definition.chips.map((chip) => (
                  <li key={chip} className="border border-line bg-panel px-3 py-1.5 text-[13px]">
                    {chip}
                  </li>
                ))}
              </ul>
            </section>

            {/* Why */}
            <section id="why" className="scroll-mt-24">
              <h2 className={h2}>{c.why.h}</h2>
              <ul className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
                {c.why.items.map((it) => (
                  <li key={it.t} className="bg-bg p-5">
                    <p className="text-[15px] font-semibold leading-6">{it.t}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{it.b}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Lifecycle */}
            <section id="lifecycle" className="scroll-mt-24">
              <h2 className={h2}>{c.lifecycle.h}</h2>
              <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-ink/90">{c.lifecycle.lead}</p>
              <ol className="mt-6 border-b border-line">
                {EASM_STAGES.map((id, n) => {
                  const s = c.lifecycle.stages[id];
                  const Icon = STAGE_ICON[id];
                  return (
                    <li key={id} id={id} className="scroll-mt-24 border-t border-line py-8">
                      <div className="flex items-center gap-3">
                        <Icon className="size-6 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                        <h3 className="text-[22px] font-semibold leading-7 tracking-[-0.015em]">
                          <span className="tabular mr-2 text-muted">{String(n + 1).padStart(2, '0')}</span>
                          {s.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted sm:pl-9">{s.question}</p>
                      <p className="mt-4 text-[15px] leading-7 text-ink/90 sm:pl-9">{s.what}</p>
                      <p className="mt-5 text-sm font-medium text-muted sm:pl-9">{c.ui.craton}</p>
                      <ul className="mt-2 flex flex-col gap-2 sm:pl-9">
                        {s.craton.map((b) => (
                          <li key={b} className="flex gap-3 text-[15px] leading-6 text-ink/90">
                            <Check className="mt-1 size-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-6 border-l-2 border-accent bg-panel px-4 py-3 text-[14px] leading-6 text-ink/90">{c.lifecycle.remediation}</p>
            </section>

            {/* Compare */}
            <section id="compare" className="scroll-mt-24">
              <h2 className={h2}>{c.compare.h}</h2>
              <p className="mt-4 text-[15px] leading-7 text-ink/90">{c.compare.lead}</p>
              <Table cols={c.compare.cols} rows={c.compare.rows} hi={c.compare.rows.length - 1} />
            </section>

            {/* Passive */}
            <section id="passive" className="scroll-mt-24">
              <h2 className={h2}>{c.passive.h}</h2>
              <div className="mt-4 flex flex-col gap-4 text-[15px] leading-7 text-ink/90">
                {c.passive.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <Link href="/#trust" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:no-underline">
                {c.passive.link}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </section>

            {/* Standards */}
            <section id="standards" className="scroll-mt-24">
              <h2 className={h2}>{c.standards.h}</h2>
              <div className="mt-4 flex flex-col gap-4 text-[15px] leading-7 text-ink/90">
                {c.standards.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <Table cols={c.standards.cols} rows={c.standards.rows} />
              <p className="mt-5 text-[15px] leading-7 text-ink/90">{c.standards.after}</p>
              <a href={NIST_CSF_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:no-underline">
                {c.standards.link}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </section>

            {/* Indonesia */}
            <section id="indonesia" className="scroll-mt-24">
              <h2 className={h2}>{c.indonesia.h}</h2>
              <div className="mt-4 flex flex-col gap-4 text-[15px] leading-7 text-ink/90">
                {c.indonesia.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <Link href="/compliance" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:no-underline">
                {c.indonesia.link}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24">
              <h2 className={h2}>{c.faq.h}</h2>
              <dl className="mt-5 border-b border-line">
                {c.faq.items.map((f) => (
                  <div key={f.q} className="border-t border-line py-5">
                    <dt className="text-[16px] font-semibold leading-6">{f.q}</dt>
                    <dd className="mt-2 text-[15px] leading-7 text-ink/90">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* CTA */}
            <section className="border border-line bg-panel p-7 sm:p-10">
              <h2 className="max-w-[20ch] text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">{c.cta.h}</h2>
              <p className="mt-4 max-w-[56ch] text-[15px] leading-7 text-muted">{c.cta.b}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className={cn(btn, 'bg-ink text-bg hover:bg-white')}>
                  {c.ui.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/compliance" className={cn(btn, 'border border-line text-ink hover:border-muted')}>
                  {c.ui.compliance}
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
      <SiteFooter lang={lang} inner="max-w-[1280px]" />
    </div>
  );
}
