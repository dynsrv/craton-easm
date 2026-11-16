'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex h-8 overflow-hidden rounded-md border border-line" role="group" aria-label="Language">
      {(['en', 'id'] as const).map((l) => (
        <button
          key={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn('px-2.5 text-xs font-medium uppercase text-muted hover:text-ink', lang === l && 'bg-panel2 text-ink')}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Remembers the report language between the dashboard and the report page. */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ng-lang');
      if (saved === 'id' || saved === 'en') setLangState(saved);
    } catch {}
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('ng-lang', l);
    } catch {}
  }, []);
  return [lang, setLang];
}

