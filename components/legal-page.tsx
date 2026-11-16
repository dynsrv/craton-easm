'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang';
import { NIGHT, SiteFooter, SiteHeader } from '@/components/site-chrome';
import { CONTACT_EMAIL, LEGAL_SLUGS, LEGAL_UPDATED, type LegalSlug } from '@/lib/legal';
import { LEGAL } from '@/lib/legal-content';
import { cn } from '@/lib/utils';

const UI = {
  en: { legal: 'Legal', updated: 'Last updated', questions: 'Questions about this page?', toc: 'On this page', review: 'This page is provided in English and Bahasa Indonesia. Use the language switch in the header.' },
  id: { legal: 'Hukum', updated: 'Diperbarui', questions: 'Ada pertanyaan tentang halaman ini?', toc: 'Di halaman ini', review: 'Halaman ini tersedia dalam bahasa Inggris dan Indonesia. Gunakan pengalih bahasa di header.' },
} as const;

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const [lang, setLang] = useLang();
  const i = lang === 'id' ? 1 : 0;
  const doc = LEGAL[slug];
  const u = UI[lang];
  const date = new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <div style={NIGHT} className="min-h-dvh bg-bg text-ink antialiased">
      <SiteHeader lang={lang} setLang={setLang} />
      <div className="mx-auto grid max-w-[1280px] gap-x-12 gap-y-8 px-5 pb-20 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-[13px] font-medium text-muted">{u.legal}</p>
          <nav aria-label={u.legal} className="flex flex-wrap gap-x-5 gap-y-2 lg:flex-col lg:gap-y-1">
            {LEGAL_SLUGS.map((s) => (
              <Link key={s} href={`/legal/${s}`} aria-current={s === slug ? 'page' : undefined} className={cn('text-[14px] leading-6 transition-colors hover:text-ink lg:border-l lg:pl-3', s === slug ? 'font-medium text-ink lg:border-ink' : 'text-muted lg:border-line')}>
                {LEGAL[s].title[i]}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 max-w-[72ch]">
          <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[48px]">{doc.title[i]}</h1>
          <p className="mt-5 text-[17px] leading-7 text-muted">{doc.summary[i]}</p>
          <p className="mt-3 text-xs text-muted">
            {u.updated} {date}
          </p>

          <nav aria-label={u.toc} className="mt-8 border border-line bg-panel p-4">
            <p className="mb-2 text-xs font-medium text-muted">{u.toc}</p>
            <ol className="grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
              {doc.sections.map((s, n) => (
                <li key={n}>
                  <a href={`#s${n + 1}`} className="text-muted hover:text-ink">
                    {s.h[i]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 flex flex-col gap-10">
            {doc.sections.map((s, n) => (
              <section key={n} id={`s${n + 1}`} className="scroll-mt-24">
                <h2 className="text-[20px] font-semibold leading-7 tracking-tight">{s.h[i]}</h2>
                <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-ink/90">
                  {s.body.map((b, k) =>
                    'p' in b ? (
                      <p key={k}>{b.p[i]}</p>
                    ) : (
                      <ul key={k} className="flex list-disc flex-col gap-2 pl-5 marker:text-muted">
                        {b.ul.map((li, j) => (
                          <li key={j}>{li[i]}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t border-line pt-5 text-[13px] text-muted">
            {u.questions}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
        </main>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
