'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const NAV = [
  { id: 'dashboard', href: '/', label: 'Dashboard' },
  { id: 'compliance', href: '/compliance', label: 'Compliance' },
  { id: 'admin', href: '/admin', label: 'Admin' },
] as const;

export function TopBar({ active, email, isAdmin = false, children }: { active: 'dashboard' | 'compliance' | 'admin' | null; email?: string; isAdmin?: boolean; children?: React.ReactNode }) {
  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/';
  };
  // Publishes the bar's height so sticky elements below it can sit flush against it, wrapped or not.
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--topbar-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <header ref={bar} className="no-print z-20 border-b border-line bg-bg/90 backdrop-blur-md sm:sticky sm:top-0">
      <div className="mx-auto flex min-h-12 max-w-[1360px] flex-wrap items-center gap-x-3 px-4 sm:h-12 sm:flex-nowrap sm:gap-x-6 sm:px-6">
        <Link href="/" aria-label="Craton home" className="shrink-0 rounded-sm">
          <Wordmark compact />
        </Link>
        <nav className="order-last -mx-2.5 flex h-10 w-full items-stretch sm:order-none sm:mx-0 sm:h-full sm:w-auto" aria-label="Main">
          {NAV.filter((n) => n.id !== 'admin' || isAdmin).map((n) => (
            <Link
              key={n.id}
              href={n.href}
              aria-current={active === n.id ? 'page' : undefined}
              className={cn(
                'flex items-center px-2.5 text-sm text-muted hover:text-ink sm:px-3',
                active === n.id && 'font-medium text-ink shadow-[inset_0_-2px_0_var(--color-primary)]',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex h-12 items-center gap-2">
          {children}
          <ThemeToggle />
          {email && <span className="ml-2 hidden max-w-[220px] truncate text-[13px] text-muted lg:inline">{email}</span>}
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line px-2 text-[13px] text-muted hover:bg-panel2 hover:text-ink sm:px-2.5"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
