'use client';

import { FileText, Loader2, Lock, Radar } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssetDrawer } from '@/components/asset-drawer';
import { ScoreGauge } from '@/components/score-gauge';
import { TopBar } from '@/components/top-bar';
import { PortChip, SeverityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { catName, sevName, SEV_VAR, T, tlsLabel, TONE_CLASS } from '@/lib/i18n';
import { SENSITIVE_PORTS } from '@/lib/ports';
import { SEVERITY_RANK } from '@/lib/score';
import { CATEGORIES, SEVERITIES, type AssetDTO, type Category, type Lang, type ScanDTO, type Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScanListItem {
  id: string;
  domain: string;
  status: string;
  score: number | null;
  createdAt: string;
}

const POLL_MS = 1500;

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-line" role="group" aria-label="Language">
      {(['en', 'id'] as const).map((l) => (
        <button
          key={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn('px-2.5 py-1 text-xs font-medium uppercase text-muted', lang === l && 'bg-panel2 text-ink shadow-[inset_0_-2px_0_var(--color-accent)]')}
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

export function Dashboard({ userEmail }: { userEmail?: string }) {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const [domain, setDomain] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [scan, setScan] = useState<ScanDTO | null>(null);
  const [recent, setRecent] = useState<ScanListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sev, setSev] = useState<Severity | 'All'>('All');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<AssetDTO | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  const loadScan = useCallback(async (id: string) => {
    const res = await fetch(`/api/scans/${id}`, { cache: 'no-store' });
    if (res.ok) setScan((await res.json()) as ScanDTO);
  }, []);

  const loadRecent = useCallback(async () => {
    const res = await fetch('/api/scans', { cache: 'no-store' });
    if (!res.ok) return [];
    const { scans } = (await res.json()) as { scans: ScanListItem[] };
    setRecent(scans);
    return scans;
  }, []);

  // On first load, open the most recent scan.
  useEffect(() => {
    loadRecent().then((scans) => scans[0] && loadScan(scans[0].id));
  }, [loadRecent, loadScan]);

  // Poll while a scan is in flight.
  const running = scan?.status === 'queued' || scan?.status === 'running';
  const scanId = scan?.id;
  useEffect(() => {
    if (!running || !scanId) return;
    const timer = setInterval(() => loadScan(scanId), POLL_MS);
    return () => clearInterval(timer);
  }, [running, scanId, loadScan]);

  useEffect(() => {
    if (!running) loadRecent();
  }, [running, loadRecent]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [scan?.log.length]);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, authorized }),
      });
      const body = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !body.id) throw new Error(body.error ?? 'Could not start the scan');
      setSelected(null);
      setSev('All');
      setCat('All');
      setQ('');
      await loadScan(body.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const assets = useMemo(
    () =>
      [...(scan?.assets ?? [])].sort(
        (a, b) => (a.severity ? SEVERITY_RANK[a.severity] : 9) - (b.severity ? SEVERITY_RANK[b.severity] : 9) || a.hostname.localeCompare(b.hostname),
      ),
    [scan?.assets],
  );
  const counts = useMemo(() => {
    const c = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<Severity, number>;
    for (const a of assets) if (a.severity) c[a.severity]++;
    return c;
  }, [assets]);
  const rows = assets.filter(
    (a) =>
      (sev === 'All' || a.severity === sev) &&
      (cat === 'All' || a.category === cat) &&
      (!q || `${a.hostname} ${a.title ?? ''} ${a.ips.join(' ')} ${a.provider}`.toLowerCase().includes(q.toLowerCase())),
  );
  const done = scan?.status === 'completed';

  return (
    <div>
      <TopBar active="dashboard" email={userEmail}>
        <LangToggle lang={lang} setLang={setLang} />
      </TopBar>

      <div className="flex flex-wrap items-start gap-x-4 gap-y-2.5 border-b border-line bg-panel2 px-4 py-2.5">
        <form onSubmit={startScan} className="flex min-w-[280px] max-w-[620px] flex-1 flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              id="domain"
              aria-label="Root domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="company.co.id"
              spellCheck={false}
              autoComplete="off"
              required
              className="field min-w-0 flex-1 font-mono"
            />
            <Button type="submit" disabled={submitting || running || !authorized}>
              {submitting || running ? <Loader2 className="animate-spin" /> : <Radar />}
              {running ? t.scanning : t.run}
            </Button>
          </div>
          <label htmlFor="authorized" className="flex items-center gap-2 text-xs text-muted">
            <input id="authorized" type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="accent-[var(--color-primary)]" />
            {t.authorize}
          </label>
        </form>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          {recent.length > 1 && (
            <select id="recent" aria-label={t.recent} value={scan?.id ?? ''} onChange={(e) => loadScan(e.target.value)} className="field w-auto max-w-[240px]">
              {recent.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.domain} · {new Date(r.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB')}
                </option>
              ))}
            </select>
          )}
          {done && scan && (
            <Link href={`/report/${scan.id}`} className="inline-flex h-[30px] items-center gap-2 rounded-sm border border-line bg-panel px-3 text-[13px] font-medium hover:border-accent">
              <FileText className="size-4" />
              {t.report}
            </Link>
          )}
        </div>
      </div>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 pb-16 pt-3">
        {error && <div role="alert" className="rounded-md border border-crit px-3 py-2 text-crit">{error}</div>}

        {!scan && (
          <Card className="py-14 text-center">
            <Radar className="mx-auto mb-3 size-8 text-accent" aria-hidden />
            <h2 className="text-lg font-semibold">{t.emptyTitle}</h2>
            <p className="mx-auto mt-1 max-w-[52ch] text-muted">{t.emptyBody}</p>
          </Card>
        )}

        {scan?.status === 'failed' && (
          <div role="alert" className="rounded-md border border-crit px-3 py-2">
            <b className="text-crit">{t.failed}:</b> {scan.error}
          </div>
        )}

        {scan && running && (
          <Card>
            <CardTitle>
              {t.progress} · {scan.domain}
            </CardTitle>
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
              <ul className="flex flex-col gap-2">
                {t.phases.map((p, i) => (
                  <li key={p} className={cn('flex items-center gap-2.5 text-muted', i < scan.phase && 'text-ink', i === scan.phase && 'text-accent')}>
                    <span className={cn('size-2.5 shrink-0 rounded-full border-2 border-current', i < scan.phase && 'border-low bg-low', i === scan.phase && 'animate-pulse')} />
                    {p}
                  </li>
                ))}
              </ul>
              <pre ref={logRef} aria-live="polite" className="h-[170px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-bg px-3 py-2.5 font-mono text-xs leading-relaxed text-muted">
                {scan.log.join('\n')}
              </pre>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded bg-bg">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${Math.round((scan.phase / 6) * 100)}%` }} />
            </div>
          </Card>
        )}

        {scan && done && (scan.source === 'dns-fallback' || scan.triagedBy !== 'llm') && (
          <div className="flex flex-col gap-1 text-[12.5px] text-muted">
            {scan.source === 'dns-fallback' && <span>⚠ {t.fallbackNote}</span>}
            {scan.triagedBy !== 'llm' && <span>ⓘ {t.heuristicNote}</span>}
          </div>
        )}

        {scan && (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[260px_1fr_1.1fr]">
              <Card>
                <CardTitle>{t.score}</CardTitle>
                {scan.score != null ? <ScoreGauge score={scan.score} t={t} /> : <p className="py-7 text-center text-muted">{t.pending}…</p>}
              </Card>

              <Card>
                <CardTitle>{t.bySev}</CardTitle>
                <div className="mb-3 flex h-3 gap-0.5 overflow-hidden rounded-sm" aria-hidden>
                  {SEVERITIES.map((s) => counts[s] > 0 && <i key={s} className="block min-w-1" style={{ background: SEV_VAR[s], flex: counts[s] }} />)}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      aria-pressed={sev === s}
                      onClick={() => setSev(sev === s ? 'All' : s)}
                      className={cn('rounded-md border border-t-[3px] border-line bg-bg px-1 py-2 text-center', sev === s && 'bg-panel2')}
                      style={{ borderTopColor: SEV_VAR[s] }}
                    >
                      <b className="tabular block text-[22px] font-bold leading-tight">{counts[s]}</b>
                      <span className="text-[11px] text-muted">{sevName(s, lang)}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3.5 grid grid-cols-4 gap-2 border-t border-line pt-3.5">
                  {(
                    [
                      [scan.namesFound, t.names],
                      [assets.length, t.live],
                      [assets.filter((a) => a.hasLoginForm).length, t.logins],
                      [assets.filter((a) => a.tlsDaysLeft != null && a.tlsDaysLeft < 30).length, t.certs],
                    ] as const
                  ).map(([n, label]) => (
                    <div key={label}>
                      <b className="tabular block font-mono text-lg font-semibold">{n}</b>
                      <span className="block text-[11.5px] leading-tight text-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="md:col-span-2 xl:col-span-1">
                <CardTitle>{t.fixes}</CardTitle>
                {scan.brief?.topFixes.length ? (
                  <ol className="flex flex-col gap-2.5">
                    {scan.brief.topFixes.map((f, i) => (
                      <li key={i} className="grid grid-cols-[26px_1fr] gap-2.5">
                        <span className="grid size-[26px] place-items-center rounded-full border border-line bg-panel2 font-mono text-sm font-bold text-accent">{i + 1}</span>
                        <div>
                          <strong className="block font-semibold">{f.title[lang]}</strong>
                          <span className="text-muted">{f.detail[lang]}</span>
                          <div className="break-all font-mono text-xs text-muted">{f.hostnames.join(' · ')}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-7 text-center text-muted">{done ? '—' : `${t.pending}…`}</p>
                )}
              </Card>
            </div>

            <Card>
              <CardTitle>
                {t.assets} · {rows.length}/{assets.length}
              </CardTitle>
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.cSev}>
                  {(['All', ...SEVERITIES] as const).map((s) => (
                    <button
                      key={s}
                      aria-pressed={sev === s}
                      onClick={() => setSev(s)}
                      className={cn('rounded-sm border border-line px-2.5 py-1 text-[12.5px] text-muted', sev === s && 'bg-panel2 text-ink')}
                      style={sev === s ? { borderColor: s === 'All' ? 'var(--color-accent)' : SEV_VAR[s] } : undefined}
                    >
                      {s === 'All' ? t.all : sevName(s, lang)}
                    </button>
                  ))}
                </div>
                <select id="cat" aria-label={t.cCat} value={cat} onChange={(e) => setCat(e.target.value as Category | 'All')} className="field w-auto">
                  <option value="All">{t.allCats}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {catName(c, lang)}
                    </option>
                  ))}
                </select>
                <input id="q" type="search" aria-label={t.search} placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} className="field min-w-[140px] flex-1" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr>
                      {[t.cSev, t.cHost, t.cCat, t.cHttp, t.cProv, t.cTls, t.cPorts].map((h) => (
                        <th key={h} className="border-b border-line px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => {
                      const tls = tlsLabel(a.tlsDaysLeft, t);
                      return (
                        <tr
                          key={a.id}
                          tabIndex={0}
                          onClick={() => setSelected(a)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelected(a)}
                          className="cursor-pointer align-top hover:bg-panel2 focus-visible:bg-panel2 focus-visible:outline-2 focus-visible:outline-accent [&>td]:border-b [&>td]:border-line [&>td]:px-2.5 [&>td]:py-2"
                          style={{ boxShadow: a.severity ? `inset 3px 0 0 ${SEV_VAR[a.severity]}` : undefined }}
                        >
                          <td>{a.severity ? <SeverityBadge severity={a.severity} label={sevName(a.severity, lang)} /> : <span className="text-muted">{t.pending}</span>}</td>
                          <td>
                            <div className="font-mono text-[13px] font-medium">{a.hostname}</div>
                            <div className="flex max-w-[340px] items-center gap-1 break-words text-xs text-muted">
                              {a.hasLoginForm && <Lock className="size-3 shrink-0" aria-label={t.login} />}
                              {a.title ?? '—'}
                            </div>
                          </td>
                          <td>{a.category ? catName(a.category, lang) : '—'}</td>
                          <td className="tabular font-mono">{a.httpStatus ?? <span className="text-muted">—</span>}</td>
                          <td>
                            {a.provider}
                            <div className="font-mono text-xs text-muted">{a.ips[0]}</div>
                          </td>
                          <td className={cn('tabular font-mono', TONE_CLASS[tls.tone])}>{tls.text}</td>
                          <td>
                            {a.ports.map((p) => (
                              <PortChip key={p} port={p} risky={p in SENSITIVE_PORTS} />
                            ))}
                            {a.cves.length > 0 && <div className="font-mono text-xs text-crit">{a.cves.length} CVE</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && <p className="py-7 text-center text-muted">{running ? t.scanning : t.none}</p>}
            </Card>
          </>
        )}
      </main>

      {selected && <AssetDrawer asset={selected} lang={lang} t={t} onClose={() => setSelected(null)} />}
    </div>
  );
}
