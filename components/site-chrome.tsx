'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CratonMark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { BUILD, CONTACT_EMAIL, LEGAL_SLUGS, OPERATOR, PRODUCT, VERSION } from '@/lib/legal';
import { LEGAL } from '@/lib/legal-content';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

/** The landing page is always dark, independent of the workspace theme. */
export const NIGHT = {
  '--color-bg': '#000000',
  '--color-panel': '#0a0a0a',
  '--color-panel2': '#161616',
  '--color-line': '#262626',
  '--color-ink': '#f5f5f5',
  '--color-primary': '#f5f5f5',
  '--color-accent': '#8ab4ff',
  '--color-muted': '#8f8f8f',
  '--color-field': '#000000',
  '--color-inverse': '#000000',
  '--color-crit': '#ff5a5f',
  '--color-high': '#ff8a3d',
  '--color-med': '#f2b233',
  '--color-low': '#f0e052',
  '--color-ok': '#4fd18b',
  '--color-info': '#8f8f8f',
  colorScheme: 'dark',
} as React.CSSProperties;

const STR = {
  en: { framework: 'Framework', brief: 'The Brief', leaders: 'For Leaders', trust: 'Trust', compliance: 'Compliance', signIn: 'Sign in', footer: 'External attack surface management', complianceLink: 'Indonesian compliance guide' },
  id: { framework: 'Kerangka', brief: 'Laporan', leaders: 'Untuk Pimpinan', trust: 'Keamanan', compliance: 'Kepatuhan', signIn: 'Masuk', footer: 'Manajemen permukaan serangan eksternal', complianceLink: 'Panduan kepatuhan Indonesia' },
} as const;

/** The public header, shared by the landing page and the compliance guide so they read as one site. */
export function SiteHeader({ lang, setLang, onLanding = false, active }: { lang: Lang; setLang: (l: Lang) => void; onLanding?: boolean; active?: 'compliance' }) {
  const s = STR[lang];
  const base = onLanding ? '' : '/';
  const links: [string, string][] = [
    [`${base}#framework`, s.framework],
    [`${base}#brief`, s.brief],
    [`${base}#leaders`, s.leaders],
    [`${base}#trust`, s.trust],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Craton home" className="flex shrink-0 items-center gap-2.5">
          <CratonMark className="size-5" />
          <span className="text-sm font-semibold tracking-[0.22em]">CRATON</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-[13px] text-muted transition-colors hover:text-ink">
              {label}
            </a>
          ))}
          <Link href="/compliance" aria-current={active === 'compliance' ? 'page' : undefined} className={cn('text-[13px] transition-colors hover:text-ink', active === 'compliance' ? 'font-medium text-ink' : 'text-muted')}>
            {s.compliance}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LangToggle lang={lang} setLang={setLang} />
          <Link href="/login" className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap bg-ink px-3.5 text-[13px] font-medium text-bg hover:bg-white">
            {s.signIn}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

const FOOT = {
  en: { legal: 'Legal' },
  id: { legal: 'Hukum' },
} as const;

/** Footer for every page: copyright, version, contact and the legal pages, in one row. It takes its colours from the surrounding theme. */
export function SiteFooter({ lang, className }: { lang: Lang; className?: string }) {
  const f = FOOT[lang];
  const build = BUILD ? ` · ${BUILD}` : '';
  return (
    <footer className={cn('no-print border-t border-line bg-bg px-5 py-6 text-xs text-muted sm:px-8', className)}>
      <div className="mx-auto flex max-w-[1360px] flex-col gap-x-8 gap-y-3 lg:flex-row lg:items-center lg:justify-between">
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
              {LEGAL[slug].title[lang === 'id' ? 1 : 0]}
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
