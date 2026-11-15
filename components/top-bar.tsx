'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import { cn } from '@/lib/utils';

const NAV = [
  { id: 'dashboard', href: '/', label: 'Dashboard' },
  { id: 'admin', href: '/admin', label: 'Admin' },
] as const;

export function TopBar({ active, email, children }: { active: 'dashboard' | 'admin' | null; email?: string; children?: React.ReactNode }) {
  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  };
  return (
    <header className="no-print sticky top-0 z-20 flex h-11 items-center gap-5 border-b border-line bg-panel px-4">
      <Link href="/" aria-label="Craton home">
        <Wordmark />
      </Link>
      <nav className="flex h-full items-stretch gap-1" aria-label="Main">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            aria-current={active === n.id ? 'page' : undefined}
            className={cn('flex items-center px-2.5 text-[13px] text-muted hover:text-ink', active === n.id && 'text-ink shadow-[inset_0_-2px_0_var(--color-accent)]')}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        {children}
        {email && <span className="hidden text-xs text-muted sm:inline">{email}</span>}
        <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-muted hover:text-ink" aria-label="Sign out">
          <LogOut className="size-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
