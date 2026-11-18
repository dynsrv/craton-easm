'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { ThemeToggle } from '@/components/theme-toggle';
import { BUILD, CONTACT_EMAIL, LEGAL_SLUGS, LEGAL_TITLES, OPERATOR, PRODUCT, VERSION } from '@/lib/legal';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

const STR = {
  en: { menu: 'Open menu', close: 'Close menu', language: 'Language', easm: 'EASM', framework: 'Framework', brief: 'The Brief', leaders: 'For Leaders', trust: 'Trust', compliance: 'Compliance', signIn: 'Sign in', footer: 'External attack surface management', complianceLink: 'Indonesian compliance guide' },
  id: { menu: 'Buka menu', close: 'Tutup menu', language: 'Bahasa', easm: 'EASM', framework: 'Kerangka', brief: 'Laporan', leaders: 'Untuk Pimpinan', trust: 'Keamanan', compliance: 'Kepatuhan', signIn: 'Masuk', footer: 'Manajemen permukaan serangan eksternal', complianceLink: 'Panduan kepatuhan Indonesia' },
} as const;

/** The public header, shared by the landing page and the compliance guide so they read as one site. */
export function SiteHeader({ lang, setLang, onLanding = false, active, inner = 'max-w-[1344px]' }: { lang: Lang; setLang: (l: Lang) => void; onLanding?: boolean; active?: 'compliance'; inner?: string }) {
  const s = STR[lang];
  const base = onLanding ? '' : '/';
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const links: [string, string][] = [
    [`${base}#easm`, s.easm],
    [`${base}#framework`, s.framework],
    [`${base}#brief`, s.brief],
    [`${base}#leaders`, s.leaders],
    [`${base}#trust`, s.trust],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className={cn('mx-auto flex h-14 items-center gap-6 px-5 sm:px-8', inner)}>
        <Link href="/" aria-label="Craton home" className="flex shrink-0 items-center">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-[13px] text-muted transition-colors hover:text-ink">
              {label}
            </a>
          ))}
          <Link href="/compliance" aria-current={active === 'compliance' ? 'page' : undefined} className={cn('text-[13px] transition-colors hover:text-ink', active === 'compliance' ? 'font-medium text-ink' : 'text-muted')}>
            {s.compliance}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden md:block">
            <LangToggle lang={lang} setLang={setLang} />
          </span>
          <ThemeToggle />
          <Link href="/login" className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap bg-ink px-3 text-[13px] font-medium text-bg hover:bg-white sm:px-3.5">
            {s.signIn}
            <ArrowUpRight className="hidden size-3.5 sm:block" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? s.close : s.menu}
            className="inline-flex size-8 shrink-0 items-center justify-center border border-line text-ink hover:border-muted md:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Menu" className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-bg px-5 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {[...links, ['/compliance', s.compliance] as [string, string]].map(([href, label]) => (
              <li key={href} className="border-b border-line">
                {href.startsWith('/compliance') ? (
                  <Link href={href} onClick={() => setOpen(false)} className="flex h-12 items-center text-[16px] text-ink">
                    {label}
                  </Link>
                ) : (
                  <a href={href} onClick={() => setOpen(false)} className="flex h-12 items-center text-[16px] text-ink">
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-muted">{s.language}</span>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </nav>
      )}
    </header>
  );
}

const FOOT = {
  en: { legal: 'Legal' },
  id: { legal: 'Hukum' },
} as const;

/** Footer for every page: copyright, version, contact and the legal pages, in one row. It takes its colours from the surrounding theme. */
export function SiteFooter({ lang, className, inner = 'max-w-[1360px]' }: { lang: Lang; className?: string; inner?: string }) {
  const f = FOOT[lang];
  const build = BUILD ? ` · ${BUILD}` : '';
  return (
    <footer className={cn('no-print border-t border-line bg-bg py-6 text-xs text-muted', className)}>
      <div className={cn('mx-auto flex flex-col gap-x-8 gap-y-3 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between', inner)}>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span>
            © {new Date().getFullYear()} {PRODUCT} · {OPERATOR}
          </span>
          <span className="tabular">
            v{VERSION}
            {build}
          </span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-2 hover:text-ink hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <nav aria-label={f.legal} className="flex flex-wrap gap-x-5 gap-y-1">
          {LEGAL_SLUGS.map((slug) => (
            <Link key={slug} href={`/legal/${slug}`} className="hover:text-ink">
              {LEGAL_TITLES[slug][lang === 'id' ? 1 : 0]}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/** For pages without their own language switch: follows the language saved by the dashboard. */
export function AppFooter({ className }: { className?: string }) {
  const [lang] = useLang();
  return <SiteFooter lang={lang} className={className} />;
}
