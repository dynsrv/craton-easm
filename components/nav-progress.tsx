'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * A thin bar at the top of the screen between clicking an internal link and the next page arriving,
 * so a click always gets an immediate response even when the page has to be fetched first.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  useEffect(() => setBusy(false), [pathname]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Capture phase: Next's <Link> cancels the default action, so look before it does.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setBusy(true);
      clearTimeout(timer);
      timer = setTimeout(() => setBusy(false), 8000); // never leave the bar stuck
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimeout(timer);
    };
  }, []);

  if (!busy) return null;
  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
      <div className="nav-progress h-full w-2/5 bg-accent" />
    </div>
  );
}
