'use client';

import { FileText, Loader2, Lock, Radar } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssetDrawer } from '@/components/asset-drawer';
import { ScoreGauge } from '@/components/score-gauge';
import { TopBar } from '@/components/top-bar';
import { PortChip, SeverityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow } from '@/components/ui/card';
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

  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const th = 'border-b border-line px-3 py-2.5 text-left text-xs font-medium text-muted';

  return (
    <div>
      <TopBar active="dashboard" email={userEmail}>
        <LangToggle lang={lang} setLang={setLang} />
      </TopBar>

      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-4 pb-20 pt-6 sm:px-6">
        <Card className="p-4">
          <form onSubmit={startScan} className="flex flex-col gap-x-5 gap-y-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <input
                id="domain"
                aria-label={t.domainLabel}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="company.co.id"
                spellCheck={false}
                autoComplete="off"
                required
                className="field min-w-0 font-mono sm:max-w-[420px] sm:flex-1"
              />
              <Button type="submit" disabled={submitting || running || !authorized}>
                {submitting || running ? <Loader2 className="animate-spin" /> : <Radar />}
                {running ? t.scanning : t.run}
              </Button>
            </div>
            <label htmlFor="authorized" className="flex items-center gap-2 text-[13px] text-muted">
              <input id="authorized" type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
              {t.authorize}
            </label>
          </form>
        </Card>

        {error && <div role="alert" className="rounded-md border border-crit px-4 py-2.5 text-crit">{error}</div>}

        {!scan && (
          <Card className="px-6 py-16 text-center">
            <Radar className="mx-auto mb-4 size-8 text-accent" aria-hidden />
            <h1 className="text-lg font-semibold">{t.emptyTitle}</h1>
            <p className="mx-auto mt-1.5 max-w-[52ch] text-muted">{t.emptyBody}</p>
          </Card>
        )}

        {scan && (
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-1">
            <div className="min-w-0">
              <p className="text-[13px] text-muted">{t.tagline}</p>
              <h1 className="break-all text-2xl font-semibold leading-8 tracking-tight">{scan.domain}</h1>
              <p className="mt-0.5 text-[13px] text-muted">
                {t.scanned} {dateFmt(scan.finishedAt ?? scan.createdAt)} · {assets.length} {t.live}
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
              {recent.length > 1 && (
                <select id="recent" aria-label={t.recent} value={scan.id} onChange={(e) => loadScan(e.target.value)} className="field min-w-0 flex-1 sm:w-[240px] sm:flex-none">
                  {recent.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.domain} · {dateFmt(r.createdAt)}
                    </option>
                  ))}
                </select>
              )}
              {done && (
                <Link href={`/report/${scan.id}`} className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-3.5 text-[13px] font-medium hover:bg-panel2">
                  <FileText className="size-4" />
                  {t.report}
                </Link>
              )}
            </div>
          </div>
        )}

        {scan?.status === 'failed' && (
          <div role="alert" className="rounded-md border border-crit px-4 py-2.5">
            <b className="font-semibold text-crit">{t.failed}:</b> {scan.error}
          </div>
        )}

        {scan && running && (
          <Card>
            <CardTitle>{t.progress}</CardTitle>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <ul className="flex flex-col gap-2.5">
                {t.phases.map((p, i) => (
                  <li key={p} className={cn('flex items-center gap-3 text-muted', i < scan.phase && 'text-ink', i === scan.phase && 'font-medium text-accent')}>
                    <span className={cn('size-2.5 shrink-0 rounded-full border-2 border-current', i < scan.phase && 'border-low bg-low', i === scan.phase && 'animate-pulse')} />
                    {p}
                  </li>
                ))}
              </ul>
              <pre ref={logRef} aria-live="polite" className="h-[190px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-bg px-3.5 py-3 font-mono text-xs leading-relaxed text-muted">
                {scan.log.join('\n')}
              </pre>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-panel2">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.round((scan.phase / 6) * 100)}%` }} />
            </div>
          </Card>
        )}

        {scan && done && (scan.source === 'dns-fallback' || scan.triagedBy !== 'llm') && (
          <div className="flex flex-col gap-1.5 rounded-md border border-line bg-panel px-4 py-3 text-[13px] text-muted">
            {scan.source === 'dns-fallback' && <span>{t.fallbackNote}</span>}
            {scan.triagedBy !== 'llm' && <span>{t.heuristicNote}</span>}
          </div>
        )}

        {scan && (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.15fr)]">
              <Card className="flex flex-col">
                <CardTitle>{t.score}</CardTitle>
                <div className="flex flex-1 items-center justify-center">
                  {scan.score != null ? <ScoreGauge score={scan.score} t={t} /> : <p className="py-8 text-muted">{t.pending}…</p>}
                </div>
              </Card>

              <Card className="flex flex-col">
                <CardTitle>{t.bySev}</CardTitle>
                <div className="mb-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-panel2" aria-hidden>
                  {SEVERITIES.map((s) => counts[s] > 0 && <i key={s} className="block min-w-1" style={{ background: SEV_VAR[s], flex: counts[s] }} />)}
                </div>
                <div className="mb-5 grid grid-cols-5 gap-1.5 sm:gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      aria-pressed={sev === s}
                      onClick={() => setSev(sev === s ? 'All' : s)}
                      className={cn('rounded-md border border-line bg-bg px-1 pb-2 pt-2.5 text-center hover:bg-panel2', sev === s && 'bg-panel2')}
                      style={{ boxShadow: `inset 0 3px 0 ${SEV_VAR[s]}`, borderColor: sev === s ? SEV_VAR[s] : undefined }}
                    >
                      <b className="tabular block text-2xl font-semibold leading-7">{counts[s]}</b>
                      <span className="block truncate text-[11px] text-muted sm:text-xs">{sevName(s, lang)}</span>
                    </button>
                  ))}
                </div>
                <div className="mb-5 border-t border-line pt-4">
                  <Eyebrow className="mb-2.5">{t.byCat}</Eyebrow>
                  <ul className="flex flex-col gap-2">
                    {CATEGORIES.map((c) => {
                      const n = assets.filter((a) => a.category === c).length;
                      return (
                        <li key={c} className="grid grid-cols-[minmax(0,1fr)_72px_20px] items-center gap-3 text-[13px] leading-5">
                          <button onClick={() => setCat(cat === c ? 'All' : c)} aria-pressed={cat === c} className={cn('truncate text-left hover:text-accent', cat === c ? 'font-medium text-accent' : n === 0 && 'text-muted')}>
                            {catName(c, lang)}
                          </button>
                          <span className="h-1.5 overflow-hidden rounded-full bg-panel2" aria-hidden>
                            <i className="block h-full rounded-full bg-primary" style={{ width: `${assets.length ? (n / assets.length) * 100 : 0}%` }} />
                          </span>
                          <span className="tabular text-right text-muted">{n}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4" style={{ marginTop: 'auto' }}>
                  {(
                    [
                      [scan.namesFound, t.names],
                      [assets.length, t.live],
                      [assets.filter((a) => a.hasLoginForm).length, t.logins],
                      [assets.filter((a) => a.tlsDaysLeft != null && a.tlsDaysLeft < 30).length, t.certs],
                    ] as const
                  ).map(([n, label]) => (
                    <div key={label}>
                      <div className="tabular text-lg font-semibold leading-7">{n}</div>
                      <div className="text-xs leading-4 text-muted">{label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="md:col-span-2 xl:col-span-1">
                <CardTitle>{t.fixes}</CardTitle>
                {scan.brief?.topFixes.length ? (
                  <ol className="flex flex-col gap-4">
                    {scan.brief.topFixes.map((f, i) => (
                      <li key={i} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
                        <span className="tabular mt-px grid size-6 place-items-center rounded-full bg-panel2 text-xs font-semibold text-accent">{i + 1}</span>
                        <div>
                          <strong className="block font-semibold leading-5">{f.title[lang]}</strong>
                          <p className="mt-0.5 text-[13px] leading-5 text-muted">{f.detail[lang]}</p>
                          <p className="mt-1 break-all font-mono text-xs leading-5 text-muted">{f.hostnames.join(' · ')}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-8 text-center text-muted">{done ? '—' : `${t.pending}…`}</p>
                )}
              </Card>
            </div>

            <Card className="p-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 pb-4 pt-5">
                <h2 className="mr-auto text-sm font-semibold leading-5">
                  {t.assets} <span className="tabular ml-1 font-normal text-muted">{rows.length === assets.length ? assets.length : `${rows.length} / ${assets.length}`}</span>
                </h2>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.cSev}>
                  {(['All', ...SEVERITIES] as const).map((s) => (
                    <button
                      key={s}
                      aria-pressed={sev === s}
                      onClick={() => setSev(s)}
                      className={cn('h-8 rounded-md border border-line px-3 text-[13px] text-muted hover:bg-panel2', sev === s && 'bg-panel2 font-medium text-ink')}
                      style={sev === s ? { borderColor: s === 'All' ? 'var(--color-primary)' : SEV_VAR[s] } : undefined}
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
                <input id="q" type="search" aria-label={t.search} placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} className="field sm:w-[220px]" />
              </div>

              <div className="overflow-x-auto border-t border-line">
                <table className="w-full min-w-[880px] border-collapse">
                  <thead>
                    <tr>
                      <th className={cn(th, 'w-[104px] pl-5')}>{t.cSev}</th>
                      <th className={th}>{t.cHost}</th>
                      <th className={th}>{t.cCat}</th>
                      <th className={cn(th, 'w-[64px]')}>{t.cHttp}</th>
                      <th className={th}>{t.cProv}</th>
                      <th className={th}>{t.cTls}</th>
                      <th className={cn(th, 'pr-5')}>{t.cPorts}</th>
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
                          className="cursor-pointer align-top hover:bg-panel2 focus-visible:bg-panel2 focus-visible:outline-offset-[-2px] [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-3"
                          style={{ boxShadow: a.severity ? `inset 3px 0 0 ${SEV_VAR[a.severity]}` : undefined }}
                        >
                          <td className="!pl-5">{a.severity ? <SeverityBadge severity={a.severity} label={sevName(a.severity, lang)} /> : <span className="text-muted">{t.pending}</span>}</td>
                          <td>
                            <div className="font-mono text-[13px] font-medium leading-5">{a.hostname}</div>
                            <div className="mt-0.5 flex max-w-[360px] items-center gap-1.5 text-xs leading-4 text-muted">
                              {a.hasLoginForm && <Lock className="size-3 shrink-0" aria-label={t.login} />}
                              <span className="truncate">{a.title ?? '—'}</span>
                            </div>
                          </td>
                          <td className="text-[13px] leading-5">{a.category ? catName(a.category, lang) : '—'}</td>
                          <td className="tabular font-mono text-[13px] leading-5">{a.httpStatus ?? <span className="text-muted">—</span>}</td>
                          <td>
                            <div className="text-[13px] leading-5">{a.provider}</div>
                            <div className="tabular mt-0.5 font-mono text-xs leading-4 text-muted">{a.ips[0]}</div>
                          </td>
                          <td className={cn('tabular whitespace-nowrap text-[13px] leading-5', TONE_CLASS[tls.tone])}>{tls.text}</td>
                          <td className="!pr-5">
                            <div className="flex flex-wrap gap-1">
                              {a.ports.map((p) => (
                                <PortChip key={p} port={p} risky={p in SENSITIVE_PORTS} />
                              ))}
                            </div>
                            {a.cves.length > 0 && <div className="tabular mt-1 text-xs font-medium text-crit">{a.cves.length} CVE</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && <p className="border-t border-line py-10 text-center text-muted">{running ? t.scanning : t.none}</p>}
            </Card>
          </>
        )}
      </main>

      {selected && <AssetDrawer asset={selected} lang={lang} t={t} onClose={() => setSelected(null)} />}
    </div>
  );
}
