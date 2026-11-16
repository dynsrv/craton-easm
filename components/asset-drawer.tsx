'use client';

import { Check, ClipboardCopy, ScanEye, X } from 'lucide-react';
import { Callout } from '@/components/ui/callout';
import { Shot } from '@/components/ui/shot';
import { CveList } from '@/components/v2/cve-list';
import { useEffect, useRef, useState } from 'react';
import { PortChip, SeverityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/card';
import { catName, sevName, tlsLabel, TONE_CLASS, visName, type Dict } from '@/lib/i18n';
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
  ];

  return (
    <>
      <div className="fixed inset-0 z-30" style={{ background: 'var(--scrim)' }} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={a.hostname}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[540px] flex-col gap-6 overflow-auto border-l border-line bg-panel p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="[overflow-wrap:anywhere] font-mono text-lg font-semibold leading-6">{a.hostname}</h3>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px]">
              {a.severity && <SeverityBadge severity={a.severity} label={sevName(a.severity, lang)} />}
              {a.category && <span className="text-muted">{catName(a.category, lang)}</span>}
            </div>
          </div>
          <Button ref={closeRef} variant="outline" size="icon" onClick={onClose} aria-label={t.close}>
            <X />
          </Button>
        </header>

        {(a.hasScreenshot || a.visualClass) && (
          <section className="flex flex-col gap-2.5">
            {a.hasScreenshot && (
              <a href={`/api/assets/${a.id}/screenshot`} target="_blank" rel="noreferrer" className="block" aria-label={`${t.screenshot}: ${a.hostname}`}>
                <Shot assetId={a.id} className="aspect-[16/10] w-full" />
              </a>
            )}
            {a.visualClass && (
              <p className="text-[13px]">
                <span className="text-muted">{t.looksLike}: </span>
                <b className="font-medium">{visName(a.visualClass, lang)}</b>
                {a.visualProduct ? <span className="text-muted"> · {a.visualProduct}</span> : null}
              </p>
            )}
            {a.visualAnomalies.length > 0 && (
              <Callout tone="warn" icon={ScanEye}>
                <ul className="flex flex-col gap-1">
                  {a.visualAnomalies.map((x, i) => (
                    <li key={i}>{x[lang]}</li>
                  ))}
                </ul>
              </Callout>
            )}
          </section>
        )}

        <section>
          <Eyebrow>{t.why}</Eyebrow>
          <p className="leading-[1.55]">{a.reasoning?.[lang] ?? t.pending}</p>
        </section>

        <Callout tone="fix" title={t.fix}>
          <p>{a.remediation?.[lang] ?? t.pending}</p>
        </Callout>

        {a.cves.length > 0 && <CveList asset={a} lang={lang} t={t} />}

        <section>
          <Eyebrow>{t.evidence}</Eyebrow>
          <dl className="grid grid-cols-[132px_minmax(0,1fr)] text-[13px]">
            {rows.map(([k, v]) => (
              <div key={k} className="col-span-2 grid grid-cols-subgrid gap-x-4 border-b border-line py-2 last:border-b-0">
                <dt className="text-muted">{k}</dt>
                <dd className="flex flex-wrap gap-1 [overflow-wrap:anywhere] font-mono text-[12.5px] leading-5">{v}</dd>
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
