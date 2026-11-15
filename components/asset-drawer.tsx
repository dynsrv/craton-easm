'use client';

import { Check, ClipboardCopy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PortChip, SeverityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { catName, sevName, SEV_VAR, tlsLabel, TONE_CLASS, type Dict } from '@/lib/i18n';
import { SENSITIVE_PORTS } from '@/lib/ports';
import type { AssetDTO, Lang } from '@/lib/types';

export function AssetDrawer({ asset: a, lang, t, onClose }: { asset: AssetDTO; lang: Lang; t: Dict; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tls = tlsLabel(a.tlsDaysLeft, t);
  const yn = (v: boolean) => <span className={v ? 'text-low' : 'text-crit'}>{v ? t.yes : t.no}</span>;

  const copy = async () => {
    const text = [
      `[${a.severity ?? '-'}] ${a.hostname}`,
      '',
      `${t.why}: ${a.reasoning?.[lang] ?? '-'}`,
      '',
      `${t.fix}: ${a.remediation?.[lang] ?? '-'}`,
      '',
      `IP ${a.ips.join(', ')} · ${a.provider} · ports ${a.ports.join(', ') || '-'}${a.cves.length ? ` · ${a.cves.join(', ')}` : ''}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const rows: [string, React.ReactNode][] = [
    [t.ip, `${a.ips.join(', ')} · ${a.provider}`],
    ['CNAME', a.cname ?? '—'],
    ['HTTP', a.httpStatus != null ? `${a.httpStatus} (${a.scheme})` : t.noHttp],
    [t.title, a.title ?? '—'],
    [t.login, a.hasLoginForm ? t.found : t.notFound],
    [t.server, a.server ?? '—'],
    [t.powered, a.poweredBy ?? '—'],
    [t.hsts, a.httpStatus == null ? '—' : yn(a.hsts)],
    [t.csp, a.httpStatus == null ? '—' : yn(a.csp)],
    [t.tls, <span key="tls" className={TONE_CLASS[tls.tone]}>{tls.text}{a.tlsIssuer ? ` · ${a.tlsIssuer}` : ''}{a.tlsError ? ` · ${a.tlsError}` : ''}</span>],
    [t.ports, a.ports.length ? a.ports.map((p) => <PortChip key={p} port={p} risky={p in SENSITIVE_PORTS} />) : '—'],
    [t.cves, <span key="cves" className={a.cves.length ? 'text-crit' : ''}>{a.cves.length ? a.cves.join(', ') : '—'}</span>],
  ];

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/60" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={a.hostname}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[520px] flex-col gap-4 overflow-auto border-l border-line bg-panel p-5"
        style={{ boxShadow: a.severity ? `inset 0 4px 0 ${SEV_VAR[a.severity]}` : undefined }}
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="break-all font-mono text-[17px] font-semibold">{a.hostname}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {a.severity && <SeverityBadge severity={a.severity} label={sevName(a.severity, lang)} />}
              {a.category && <span className="text-muted">{catName(a.category, lang)}</span>}
            </div>
          </div>
          <Button ref={closeRef} variant="outline" size="icon" onClick={onClose} aria-label={t.close}>
            <X />
          </Button>
        </header>

        <section>
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t.why}</h4>
          <p className="max-w-[65ch]">{a.reasoning?.[lang] ?? t.pending}</p>
        </section>

        <section className="rounded-md border border-l-[3px] border-line border-l-low bg-bg p-3">
          <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t.fix}</h4>
          <p className="max-w-[65ch]">{a.remediation?.[lang] ?? t.pending}</p>
        </section>

        <section>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t.evidence}</h4>
          <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="break-words font-mono text-[12.5px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div>
          <Button variant="outline" onClick={copy}>
            {copied ? <Check /> : <ClipboardCopy />}
            {copied ? t.copied : t.copy}
          </Button>
        </div>
      </aside>
    </>
  );
}
