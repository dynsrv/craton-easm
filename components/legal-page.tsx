'use client';

import Link from 'next/link';
import { Gavel, Scale, ShieldCheck, ShieldAlert, MessageSquareWarning, type LucideIcon } from 'lucide-react';
import { useLang } from '@/components/lang';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { CONTACT_EMAIL, LEGAL_SLUGS, LEGAL_UPDATED, type LegalSlug } from '@/lib/legal';
import { LEGAL } from '@/lib/legal-content';
import { cn } from '@/lib/utils';

const UI = {
  en: { legal: 'Legal', updated: 'Last updated', questions: 'Questions about this page?' },
  id: { legal: 'Hukum', updated: 'Diperbarui', questions: 'Ada pertanyaan tentang halaman ini?' },
} as const;

const ICON: Record<LegalSlug, LucideIcon> = {
  terms: Gavel,
  privacy: ShieldCheck,
  'acceptable-use': ShieldAlert,
  liability: Scale,
  complaints: MessageSquareWarning,
};

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const [lang, setLang] = useLang();
  const i = lang === 'id' ? 1 : 0;
  const doc = LEGAL[slug];
  const u = UI[lang];
  const date = new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="min-h-dvh bg-bg text-ink antialiased">
      <SiteHeader lang={lang} setLang={setLang} />
      <div className="mx-auto grid max-w-[1344px] gap-x-12 gap-y-8 px-5 pb-20 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">{u.legal}</p>
          <nav aria-label={u.legal} className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {LEGAL_SLUGS.map((s) => {
              const Icon = ICON[s];
              const on = s === slug;
              return (
                <div key={s} className="shrink-0">
                  <Link
                    href={`/legal/${s}`}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 border border-transparent px-3 py-2.5 text-[14px] leading-5 transition-colors',
                      on ? 'border-line bg-panel font-medium text-ink shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-muted hover:bg-panel hover:text-ink',
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', on ? 'text-accent' : 'text-muted group-hover:text-ink')} strokeWidth={1.75} aria-hidden />
                    <span className="whitespace-nowrap lg:whitespace-normal">{LEGAL[s].title[i]}</span>
                  </Link>
                  {on && (
                    <ol className="ml-[22px] mt-1 hidden flex-col border-l border-line py-1 lg:flex">
                      {doc.sections.map((sec, n) => (
                        <li key={n}>
                          <a href={`#s${n + 1}`} className="block py-1 pl-4 pr-2 text-[13px] leading-5 text-muted transition-colors hover:text-ink">
                            {sec.h[i]}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 max-w-[860px]">
          <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[48px]">{doc.title[i]}</h1>
          <p className="mt-4 text-xs text-muted">
            {u.updated} {date}
          </p>

          <div className="mt-9 flex flex-col gap-10">
            {doc.sections.map((s, n) => (
              <section key={n} id={`s${n + 1}`} className="scroll-mt-24">
                <h2 className="text-[20px] font-semibold leading-7 tracking-tight">{s.h[i]}</h2>
                <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-ink/90">
                  {s.body.map((b, k) =>
                    'p' in b ? (
                      <p key={k}>{b.p[i]}</p>
                    ) : (
                      <ul key={k} className="flex flex-col gap-2">
                        {b.ul.map((li, j) => (
                          <li key={j} className="relative pl-5 before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:bg-muted">
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

          <p className="mt-12 border-t border-line pt-5 text-[13px] text-muted">
            {u.questions}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
        </main>
      </div>
      <SiteFooter lang={lang} inner="max-w-[1344px]" />
    </div>
  );
}
