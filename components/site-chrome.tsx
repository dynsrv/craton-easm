'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { ThemeToggle } from '@/components/theme-toggle';
import { BUILD, CONTACT_EMAIL, LEGAL_SLUGS, OPERATOR, PRODUCT, VERSION } from '@/lib/legal';
import { LEGAL } from '@/lib/legal-content';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

const STR = {
  en: { easm: 'EASM', framework: 'Framework', brief: 'The Brief', leaders: 'For Leaders', trust: 'Trust', compliance: 'Compliance', signIn: 'Sign in', footer: 'External attack surface management', complianceLink: 'Indonesian compliance guide' },
  id: { easm: 'EASM', framework: 'Kerangka', brief: 'Laporan', leaders: 'Untuk Pimpinan', trust: 'Keamanan', compliance: 'Kepatuhan', signIn: 'Masuk', footer: 'Manajemen permukaan serangan eksternal', complianceLink: 'Panduan kepatuhan Indonesia' },
} as const;

/** The public header, shared by the landing page and the compliance guide so they read as one site. */
export function SiteHeader({ lang, setLang, onLanding = false, active, inner = 'max-w-[1280px]' }: { lang: Lang; setLang: (l: Lang) => void; onLanding?: boolean; active?: 'compliance'; inner?: string }) {
  const s = STR[lang];
  const base = onLanding ? '' : '/';
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
        <div className="ml-auto flex items-center gap-3">
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle />
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
