'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CratonMark } from '@/components/brand';
import { LangToggle } from '@/components/lang';
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

export function SiteFooter({ lang }: { lang: Lang }) {
  const s = STR[lang];
  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2.5">
          <CratonMark className="size-4" />
          <span className="text-xs font-semibold tracking-[0.22em]">CRATON</span>
          <span className="text-[13px] text-muted">· {s.footer}</span>
        </span>
        <span className="flex flex-wrap items-center gap-6 text-[13px] text-muted">
          <span>security.digitalstrategy.id</span>
          <span>© 2026</span>
          <Link href="/compliance" className="hover:text-ink">
            {s.complianceLink}
          </Link>
          <Link href="/login" className="hover:text-ink">
            {s.signIn}
          </Link>
        </span>
      </div>
    </footer>
  );
}
