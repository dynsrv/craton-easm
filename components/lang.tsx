'use client';

import { useCallback, useSyncExternalStore } from 'react';
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
const LANG_EVENT = 'ng-lang-change';

function readLang(): Lang {
  try {
    const saved = localStorage.getItem('ng-lang');
    if (saved === 'id' || saved === 'en') return saved;
  } catch {}
  return 'en';
}

function subscribeLang(onChange: () => void) {
  window.addEventListener(LANG_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(LANG_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * The saved language. When the page is built on the server it renders English; after that React switches to
 * the saved value. When moving between pages inside the app the saved value is used straight away, so
 * there is no flash of English on the way in.
 */
export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribeLang, readLang, () => 'en' as Lang);
  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem('ng-lang', l);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);
  return [lang, setLang];
}

