'use client';

import { ArrowLeft, ArrowRight, ArrowUpRight, Ban, FileText, Lock, type LucideIcon, MessageSquareWarning, Scale, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/components/lang';
import { NIGHT, SiteFooter, SiteHeader } from '@/components/site-chrome';
import { NumBadge } from '@/components/ui/num-badge';
import { CONTACT_EMAIL, LEGAL_SLUGS, LEGAL_UPDATED, type LegalSlug } from '@/lib/legal';
import { LEGAL, type LegalDoc } from '@/lib/legal-content';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

export const LEGAL_ICON: Record<LegalSlug, LucideIcon> = {
  terms: FileText,
  privacy: Lock,
  'acceptable-use': Ban,
  liability: Scale,
  complaints: MessageSquareWarning,
};

const UI = {
  en: { legal: 'Legal', updated: 'Last updated', toc: 'On this page', short: 'In short', min: 'min read', sections: 'sections', prev: 'Previous', next: 'Next', all: 'All legal pages', questions: 'Questions about this page?', hubTitle: 'The rules, in plain language.', hubLead: 'How you may use Craton, how we handle your data, and what to do if something goes wrong. Available in English and Bahasa Indonesia.', read: 'Read', contactTitle: 'Still have a question?', contactBody: 'Write to us and a person will answer.', principles: 'Our commitments' },
  id: { legal: 'Hukum', updated: 'Diperbarui', toc: 'Di halaman ini', short: 'Singkatnya', min: 'menit baca', sections: 'bagian', prev: 'Sebelumnya', next: 'Berikutnya', all: 'Semua halaman hukum', questions: 'Ada pertanyaan tentang halaman ini?', hubTitle: 'Aturannya, dalam bahasa sederhana.', hubLead: 'Cara Anda boleh memakai Craton, cara kami mengelola data Anda, dan apa yang dilakukan jika ada masalah. Tersedia dalam bahasa Inggris dan Indonesia.', read: 'Baca', contactTitle: 'Masih ada pertanyaan?', contactBody: 'Tulis kepada kami dan seseorang akan menjawab.', principles: 'Komitmen kami' },
} as const;

const PRINCIPLES: Record<Lang, { icon: LucideIcon; head: string; body: string }[]> = {
  en: [
    { icon: ShieldCheck, head: 'Passive by design', body: 'Outside-in checks only. No logins, exploits or intrusive tests.' },
    { icon: Lock, head: 'Your data stays yours', body: 'We do not sell personal data or use it for advertising.' },
    { icon: FileText, head: 'Only domains you may assess', body: 'Every scan starts with your confirmation of authority.' },
    { icon: MessageSquareWarning, head: 'A real person replies', body: 'Complaints and abuse reports go to one inbox with set response times.' },
  ],
  id: [
    { icon: ShieldCheck, head: 'Pasif sejak awal', body: 'Hanya pemeriksaan dari luar. Tanpa login, eksploitasi, atau uji intrusif.' },
    { icon: Lock, head: 'Data tetap milik Anda', body: 'Kami tidak menjual data pribadi atau memakainya untuk iklan.' },
    { icon: FileText, head: 'Hanya domain yang boleh Anda nilai', body: 'Setiap pindai dimulai dengan pernyataan kewenangan Anda.' },
    { icon: MessageSquareWarning, head: 'Ada orang yang membalas', body: 'Pengaduan dan laporan penyalahgunaan masuk ke satu kotak surat dengan waktu respons yang jelas.' },
  ],
};

const strip = (h: string) => h.replace(/^\d+\.\s*/, '');
const words = (d: LegalDoc, i: 0 | 1) => d.sections.reduce((n, s) => n + s.h[i].split(/\s+/).length + s.body.reduce((m, b) => m + ('p' in b ? b.p[i].split(/\s+/).length : b.ul.reduce((x, li) => x + li[i].split(/\s+/).length, 0)), 0), 0);
const minutes = (d: LegalDoc, i: 0 | 1) => Math.max(1, Math.round(words(d, i) / 210));
const fmtDate = (lang: Lang) => new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[15px] font-medium text-muted">
      <Scale className="size-4" strokeWidth={1.75} aria-hidden />
      {children}
    </p>
  );
}

/** The accent glow behind both heroes, the same quiet wash the landing page uses. */
function Glow() {
  return <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] opacity-70" style={{ background: 'radial-gradient(60% 60% at 18% 0%, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 70%)' }} />;
}

function Shell({ lang, setLang, children }: { lang: Lang; setLang: (l: Lang) => void; children: React.ReactNode }) {
  return (
    <div style={NIGHT} className="relative min-h-dvh overflow-x-clip bg-bg text-ink antialiased">
      <Glow />
      <div className="relative">
        <SiteHeader lang={lang} setLang={setLang} />
        {children}
        <SiteFooter lang={lang} inner="max-w-[1280px]" />
      </div>
    </div>
  );
}

/** /legal: one card per document, then the commitments behind them. */
export function LegalHub() {
  const [lang, setLang] = useLang();
  const i = lang === 'id' ? 1 : 0;
  const u = UI[lang];
  return (
    <Shell lang={lang} setLang={setLang}>
      <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
        <Eyebrow>{u.legal}</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] text-[44px] font-semibold leading-[1] tracking-[-0.035em] sm:text-[64px] lg:text-[80px]">{u.hubTitle}</h1>
        <p className="mt-6 max-w-[58ch] text-[17px] leading-7 text-muted">{u.hubLead}</p>
        <p className="mt-4 text-xs text-muted">
          {u.updated} {fmtDate(lang)}
        </p>

        <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_SLUGS.map((slug, n) => {
            const doc = LEGAL[slug];
            const Icon = LEGAL_ICON[slug];
            return (
              <li key={slug} className="bg-panel">
                <Link href={`/legal/${slug}`} className="group flex h-full min-h-[240px] flex-col gap-4 p-6 transition-colors hover:bg-panel2 sm:p-7">
                  <span className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center border border-line text-ink transition-colors group-hover:border-accent group-hover:text-accent">
                      <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="tabular text-xs text-muted">
                      {minutes(doc, i)} {u.min}
                    </span>
                  </span>
                  <span className="text-[20px] font-semibold leading-7 tracking-tight">{doc.title[i]}</span>
                  <span className="text-[14px] leading-6 text-muted">{doc.summary[i]}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-2 text-[13px] font-medium text-ink">
                    {u.read}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                    <span className="sr-only">{n + 1}</span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="flex min-h-[240px] flex-col gap-4 bg-bg p-6 sm:p-7">
            <span className="text-[20px] font-semibold leading-7 tracking-tight">{u.contactTitle}</span>
            <span className="text-[14px] leading-6 text-muted">{u.contactBody}</span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-auto inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-accent hover:underline">
              {CONTACT_EMAIL}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </li>
        </ul>

        <section className="mt-24">
          <h2 className="text-[13px] font-medium text-muted">{u.principles}</h2>
          <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES[lang].map((p) => (
              <li key={p.head} className="border-t border-line pt-5">
                <p.icon className="size-5 text-accent" strokeWidth={1.6} aria-hidden />
                <p className="mt-4 text-[15px] font-semibold leading-6">{p.head}</p>
                <p className="mt-1.5 text-[14px] leading-6 text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Shell>
  );
}

/** Highlights the contents entry of the section being read. */
function useActiveSection(count: number) {
  const [active, setActive] = useState(1);
  useEffect(() => {
    const els = Array.from({ length: count }, (_, n) => document.getElementById(`s${n + 1}`)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (seen) setActive(Number(seen.target.id.slice(1)));
      },
      { rootMargin: '-96px 0px -65% 0px' },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [count]);
  return active;
}

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const [lang, setLang] = useLang();
  const i = lang === 'id' ? 1 : 0;
  const doc = LEGAL[slug];
  const u = UI[lang];
  const Icon = LEGAL_ICON[slug];
  const active = useActiveSection(doc.sections.length);
  const at = LEGAL_SLUGS.indexOf(slug);
  const prev = at > 0 ? LEGAL_SLUGS[at - 1] : null;
  const next = at < LEGAL_SLUGS.length - 1 ? LEGAL_SLUGS[at + 1] : null;
  const mins = useMemo(() => minutes(doc, i), [doc, i]);

  return (
    <Shell lang={lang} setLang={setLang}>
      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
        <Link href="/legal" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden />
          {u.all}
        </Link>

        <header className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <span className="grid size-12 place-items-center border border-line bg-panel text-accent">
              <Icon className="size-6" strokeWidth={1.5} aria-hidden />
            </span>
            <h1 className="mt-6 text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">{doc.title[i]}</h1>
            <p className="mt-5 max-w-[56ch] text-[17px] leading-7 text-muted">{doc.summary[i]}</p>
            <p className="tabular mt-4 flex flex-wrap gap-x-4 text-xs text-muted">
              <span>
                {u.updated} {fmtDate(lang)}
              </span>
              <span>
                {mins} {u.min}
              </span>
              <span>
                {doc.sections.length} {u.sections}
              </span>
            </p>
          </div>

          <aside className="border border-line bg-panel p-5 sm:p-6" aria-label={u.short}>
            <p className="text-[13px] font-medium text-accent">{u.short}</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {doc.short.map((s, n) => (
                <li key={n} className="flex items-start gap-3 text-[14px] leading-6">
                  <NumBadge n={n + 1} className="mt-0.5" />
                  <span>{s[i]}</span>
                </li>
              ))}
            </ul>
          </aside>
        </header>

        <div className="mt-16 grid gap-x-14 gap-y-10 border-t border-line pt-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-[13px] font-medium text-muted">{u.toc}</p>
            <nav aria-label={u.toc} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
              {doc.sections.map((s, n) => (
                <a
                  key={n}
                  href={`#s${n + 1}`}
                  aria-current={active === n + 1 ? 'location' : undefined}
                  className={cn('shrink-0 whitespace-nowrap border border-line px-3 py-1.5 text-[13px] leading-5 transition-colors lg:whitespace-normal lg:border-0 lg:border-l lg:px-3.5', active === n + 1 ? 'border-ink bg-panel2 font-medium text-ink lg:bg-transparent' : 'text-muted hover:text-ink')}
                >
                  {strip(s.h[i])}
                </a>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 max-w-[70ch]">
            <div className="flex flex-col gap-14">
              {doc.sections.map((s, n) => (
                <section key={n} id={`s${n + 1}`} className="scroll-mt-24">
                  <h2 className="flex items-start gap-3.5 text-[22px] font-semibold leading-7 tracking-tight">
                    <NumBadge n={n + 1} className="mt-0.5 size-7 text-[13px]" />
                    {strip(s.h[i])}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4 pl-0 text-[15.5px] leading-[1.75] text-ink/85 sm:pl-[42px]">
                    {s.body.map((b, k) =>
                      'p' in b ? (
                        <p key={k}>{b.p[i]}</p>
                      ) : (
                        <ul key={k} className="flex flex-col gap-2.5">
                          {b.ul.map((li, j) => (
                            <li key={j} className="relative pl-5 before:absolute before:left-0 before:top-[0.8em] before:size-1.5 before:rounded-full before:bg-accent/70">
                              {li[i]}
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>

            <p className="mt-16 border-t border-line pt-5 text-[13px] text-muted">
              {u.questions}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </p>

            <nav aria-label={u.legal} className="mt-8 grid gap-3 sm:grid-cols-2">
              {[prev && { slug: prev, label: u.prev, dir: 'prev' as const }, next && { slug: next, label: u.next, dir: 'next' as const }].map((x, n) =>
                x ? (
                  <Link key={x.slug} href={`/legal/${x.slug}`} className={cn('group flex flex-col gap-1.5 border border-line bg-panel p-5 transition-colors hover:border-accent/60 hover:bg-panel2', x.dir === 'next' && 'sm:items-end sm:text-right')}>
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      {x.dir === 'prev' && <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden />}
                      {x.label}
                      {x.dir === 'next' && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />}
                    </span>
                    <span className="text-[15px] font-semibold">{LEGAL[x.slug].title[i]}</span>
                  </Link>
                ) : (
                  <span key={n} className="hidden sm:block" />
                ),
              )}
            </nav>
          </main>
        </div>
      </div>
    </Shell>
  );
}
