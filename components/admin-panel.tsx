'use client';

import { BellRing, Bot, Check, Copy, GitBranch, KeyRound, Loader2, Plug, Radar, ServerCog, Sparkles, Trash2, UserPlus, Users as UsersIcon, Webhook, type LucideIcon } from 'lucide-react';
import { IconTile } from '@/components/ui/icon-tile';
import { useCallback, useEffect, useState } from 'react';
import { PasswordForm } from '@/components/password-form';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { UsageSummary } from '@/lib/ai/usage';

interface SettingView {
  key: string;
  secret: boolean;
  source: 'database' | 'env' | 'none';
  display: string | null;
}
interface UserRow {
  id: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const SOURCE_LABEL = { database: 'Saved here', env: 'From environment variable', none: 'Not set' } as const;
const SERVICE_ICON: Record<string, { icon: LucideIcon; tone: string }> = {
  OPENAI_API_KEY: { icon: Bot, tone: 'var(--color-tone-teal)' },
  ANTHROPIC_API_KEY: { icon: Sparkles, tone: 'var(--color-tone-amber)' },
  SHODAN_API_KEY: { icon: Radar, tone: 'var(--color-tone-rose)' },
  OTX_API_KEY: { icon: Radar, tone: 'var(--color-tone-teal)' },
  GITHUB_TOKEN: { icon: GitBranch, tone: 'var(--color-tone-violet)' },
  ALERT_WEBHOOK_URL: { icon: Webhook, tone: 'var(--color-tone-sky)' },
};

const SECRETS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API key', help: 'Primary model for triage and the executive brief.' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API key', help: 'Used when no OpenAI key is set, or when the provider is Anthropic.' },
  { key: 'SHODAN_API_KEY', label: 'Shodan API key', help: 'Optional. Without it the free InternetDB is used for ports and CVEs.' },
  { key: 'OTX_API_KEY', label: 'AlienVault OTX key', help: 'Optional. Adds passive-DNS subdomains from OTX threat intelligence. Free key at otx.alienvault.com.' },
  { key: 'GITHUB_TOKEN', label: 'GitHub token', help: 'Enables the public code check. A fine-grained token with no repository access is enough for code search.' },
  { key: 'ALERT_WEBHOOK_URL', label: 'Alert webhook URL', help: 'HTTPS endpoint that receives high-severity drift as JSON. Slack and Teams incoming webhooks work as-is.' },
] as const;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export function AdminPanel({ email }: { email: string }) {
  return (
    <div>
      <TopBar active="admin" email={email} />
      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-4 pb-20 pt-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-tight">Administration</h1>
          <p className="mt-0.5 text-muted">Backend services, operator accounts and your own password.</p>
        </div>
        <ServiceSettings />
        <UsageSummaryCard />
        <DataSources />
        <Users />
        <Card>
          <CardTitle icon={KeyRound} tone="var(--color-tone-amber)">Your password</CardTitle>
          <PasswordForm />
        </Card>
      </main>
    </div>
  );
}

function ServiceSettings() {
  const [settings, setSettings] = useState<SettingView[] | null>(null);
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [modelSource, setModelSource] = useState<'live' | 'fallback' | null>(null);
  const [customModel, setCustomModel] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'save' | 'test' | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback((list: SettingView[]) => {
    setSettings(list);
    const get = (k: string) => list.find((s) => s.key === k);
    setProvider(get('AI_PROVIDER')?.display ?? '');
    setModel(get('TRIAGE_MODEL')?.display ?? '');
    setKeys({});
  }, []);

  useEffect(() => {
    api<{ settings: SettingView[] }>('/api/admin/settings')
      .then((r) => apply(r.settings))
      .catch((e: Error) => setNote({ ok: false, text: e.message }));
  }, [apply]);

  useEffect(() => {
    let live = true;
    const q = provider ? `?provider=${provider}` : '';
    api<{ models: string[]; source: 'live' | 'fallback' }>(`/api/admin/models${q}`)
      .then((r) => {
        if (!live) return;
        setModels(r.models);
        setModelSource(r.source);
      })
      .catch(() => live && setModelSource(null));
    return () => {
      live = false;
    };
  }, [provider]);

  const save = async (values: Record<string, string | null>, done = 'Settings saved.') => {
    setBusy('save');
    setNote(null);
    try {
      const r = await api<{ settings: SettingView[] }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ values }) });
      apply(r.settings);
      setNote({ ok: true, text: done });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only send keys the admin typed; untouched secrets stay as they are.
    const values: Record<string, string | null> = { AI_PROVIDER: provider || null, TRIAGE_MODEL: model || null };
    for (const [k, v] of Object.entries(keys)) if (v.trim()) values[k] = v.trim();
    save(values);
  };

  const testWebhook = async () => {
    setBusy('test');
    setNote(null);
    try {
      const r = await api<{ ok: boolean; message: string }>('/api/admin/settings/test-webhook', { method: 'POST' });
      setNote({ ok: r.ok, text: r.message });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const test = async () => {
    setBusy('test');
    setNote(null);
    try {
      const r = await api<{ ok: boolean; message: string }>('/api/admin/settings/test', { method: 'POST' });
      setNote({ ok: r.ok, text: r.message });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const bySecret = (k: string) => settings?.find((s) => s.key === k);

  return (
    <Card>
      <CardTitle icon={ServerCog} tone="var(--color-accent)">AI, data and alert services</CardTitle>
      {!settings ? (
        <p className="py-4 text-muted">{note ? note.text : 'Loading…'}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="provider" className="label">AI provider</label>
              <Select
                id="provider"
                value={provider || 'auto'}
                onValueChange={(v) => setProvider(v === 'auto' ? '' : v)}
                className="w-full"
                options={[
                  { value: 'auto', label: 'Automatic', hint: 'OpenAI first, then Anthropic' },
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                ]}
                renderValue={(o) => (o?.hint ? <>{o.label} <span className="text-muted">· {o.hint}</span></> : o?.label)}
              />
            </div>
            <div>
              <label htmlFor="model" className="label">Model</label>
              {customModel ? (
                <input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-5-mini / claude-haiku-5-5"
                  spellCheck={false}
                  className="field font-mono"
                  autoFocus
                />
              ) : (
                <Select
                  id="model"
                  value={model || 'default'}
                  onValueChange={(v) => setModel(v === 'default' ? '' : v)}
                  className="w-full font-mono"
                  options={[
                    { value: 'default', label: 'Default', hint: 'recommended' },
                    ...(model && !models.includes(model) ? [{ value: model, label: model }] : []),
                    ...models.map((m) => ({ value: m, label: m })),
                  ]}
                  renderValue={(o) => (o?.value === 'default' ? <>Default <span className="text-muted">· recommended</span></> : o?.label)}
                />
              )}
              <p className="hint mt-1.5 flex items-center justify-between gap-2">
                <span>{modelSource === 'live' ? 'Live list from your API key' : modelSource === 'fallback' ? 'Common models (add a key for the live list)' : ' '}</span>
                <button type="button" className="text-accent hover:underline" onClick={() => setCustomModel((v) => !v)}>
                  {customModel ? 'Pick from list' : 'Custom ID'}
                </button>
              </p>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-line border-y border-line">
            {SECRETS.map(({ key, label, help }) => {
              const s = bySecret(key);
              return (
                <div key={key} className="grid items-start gap-x-5 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                  <div className="flex gap-3">
                    <IconTile icon={SERVICE_ICON[key].icon} tone={SERVICE_ICON[key].tone} />
                    <div>
                      <label htmlFor={key} className="block text-[13px] font-medium leading-5">{label}</label>
                      <p className="hint mt-0.5">{help}</p>
                    </div>
                  </div>
                  <div>
                    <input
                      id={key}
                      type="password"
                      autoComplete="off"
                      value={keys[key] ?? ''}
                      onChange={(e) => setKeys({ ...keys, [key]: e.target.value })}
                      placeholder={s?.display ? `${s.display}  (enter a new value to replace)` : key === 'ALERT_WEBHOOK_URL' ? 'https://hooks.slack.com/services/…' : 'Paste key'}
                      spellCheck={false}
                      className="field font-mono"
                    />
                    <p className="hint mt-1.5 flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${s?.source === 'none' ? 'bg-line' : 'bg-low'}`} />
                      {SOURCE_LABEL[s?.source ?? 'none']}
                    </p>
                  </div>
                  <Button type="button" variant="outline" disabled={s?.source !== 'database' || busy !== null} onClick={() => save({ [key]: null }, `${label} removed.`)}>
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button type="submit" disabled={busy !== null}>
              {busy === 'save' && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
            <Button type="button" variant="outline" disabled={busy !== null} onClick={test}>
              {busy === 'test' ? <Loader2 className="animate-spin" /> : <Plug />}
              Test AI connection
            </Button>
            <Button type="button" variant="outline" disabled={busy !== null || bySecret('ALERT_WEBHOOK_URL')?.source === 'none'} onClick={testWebhook}>
              <BellRing />
              Send test alert
            </Button>
            {note && <span role="status" className={note.ok ? 'text-low' : 'text-crit'}>{note.text}</span>}
          </div>
          <p className="hint">Keys are encrypted before they are stored and are never sent back to the browser. A key saved here overrides the matching environment variable.</p>
        </form>
      )}
    </Card>
  );
}

function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [me, setMe] = useState('');
  const [email, setEmail] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ users: UserRow[]; me: string }>('/api/admin/users')
      .then((r) => {
        setUsers(r.users);
        setMe(r.me);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const r = await api<{ users: UserRow[]; created: { email: string; password: string } }>('/api/admin/users', { method: 'POST', body: JSON.stringify({ email }) });
      setUsers(r.users);
      setCreated(r.created);
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const r = await api<{ users: UserRow[] }>(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setUsers(r.users);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');

  return (
    <Card>
      <CardTitle icon={UsersIcon} tone="var(--color-tone-teal)">Administrators · {users.length}</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              {['Email', 'Status', 'Last sign-in', ''].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted first:pl-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-2.5 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0">
                <td className="font-mono text-[13px]">{u.email}{u.id === me && <span className="ml-2 font-sans text-xs text-muted">(you)</span>}</td>
                <td className={u.mustChangePassword ? 'text-med' : 'text-low'}>{u.mustChangePassword ? 'One-time password pending' : 'Active'}</td>
                <td className="tabular text-muted">{date(u.lastLoginAt)}</td>
                <td className="text-right">
                  {u.id !== me && (
                    <Button variant="ghost" size="sm" onClick={() => remove(u.id)} aria-label={`Remove ${u.email}`}>
                      <Trash2 />
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="mt-5 flex flex-wrap items-end gap-2.5">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="new-user" className="label">Add administrator</label>
          <input id="new-user" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.co.id" className="field" />
        </div>
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Create with one-time password
        </Button>
      </form>
      {error && <p role="alert" className="mt-2 text-[12.5px] text-crit">{error}</p>}
      {created && (
        <div role="status" className="mt-3 rounded-md border border-low bg-bg p-3">
          <p className="text-[13px]">
            One-time password for <b>{created.email}</b>. It is shown only now; pass it on through a private channel. They must change it at first sign-in.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded-md border border-line bg-panel px-2 py-1 font-mono text-[13px]">{created.password}</code>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

const fmtUsd = (n: number) => (n < 0.01 && n > 0 ? '<$0.01' : `$${n.toFixed(n < 10 ? 2 : n < 1000 ? 2 : 0)}`);
const fmtInt = (n: number) => n.toLocaleString('en-US');
const fmtTok = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const OP_LABEL: Record<string, string> = {
  triage: 'Asset triage',
  brief: 'Executive brief',
  'attack-paths': 'Attack paths',
  exploit: 'Exploit analysis',
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-panel p-5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="tabular mt-2 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function UsageSummaryCard() {
  const [u, setU] = useState<UsageSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ summary: UsageSummary }>('/api/admin/usage')
      .then((r) => setU(r.summary))
      .catch((e: Error) => setErr(e.message));
  }, []);

  const maxDay = u ? Math.max(0.0001, ...u.daily.map((d) => d.costUsd)) : 1;

  return (
    <Card>
      <CardTitle icon={ServerCog} tone="var(--color-tone-teal)">AI usage & cost</CardTitle>
      {err && <p className="py-4 text-[13px] text-crit">{err}</p>}
      {!u && !err && <p className="py-4 text-muted">Loading…</p>}
      {u && u.totals.calls === 0 && <p className="py-4 text-[13px] text-muted">No AI calls recorded yet. Run a scan or an exploit analysis to see usage here.</p>}
      {u && u.totals.calls > 0 && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            <Stat label="Est. cost, all time" value={fmtUsd(u.totals.costUsd)} sub={`${fmtInt(u.totals.calls)} calls`} />
            <Stat label="Today" value={fmtUsd(u.today.costUsd)} sub={`${fmtInt(u.today.calls)} calls`} />
            <Stat label="Last 30 days" value={fmtUsd(u.last30d.costUsd)} sub={`${fmtInt(u.last30d.calls)} calls`} />
          </div>

          {u.daily.length > 1 && (
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Daily cost · last 30 days</p>
              <div className="flex h-24 items-end gap-1" role="img" aria-label="Daily AI cost for the last 30 days">
                {u.daily.map((d) => (
                  <div key={d.date} className="group relative flex-1" title={`${d.date}: ${fmtUsd(d.costUsd)} · ${d.calls} calls`}>
                    <div className="w-full bg-ink/80 transition-colors group-hover:bg-ink" style={{ height: `${Math.max(2, (d.costUsd / maxDay) * 96)}px` }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">By operation</p>
              <table className="w-full text-[13px]">
                <tbody>
                  {u.byOperation.map((o) => (
                    <tr key={o.operation} className="border-t border-line first:border-t-0">
                      <td className="py-2 pr-3">{OP_LABEL[o.operation] ?? o.operation}</td>
                      <td className="tabular py-2 pr-3 text-right text-muted">{fmtInt(o.calls)}</td>
                      <td className="tabular py-2 pr-3 text-right font-mono text-xs text-muted">{fmtTok(o.inputTokens)}/{fmtTok(o.outputTokens)}</td>
                      <td className="tabular py-2 text-right font-medium">{fmtUsd(o.costUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">By model</p>
              <table className="w-full text-[13px]">
                <tbody>
                  {u.byModel.map((m) => (
                    <tr key={`${m.provider}/${m.model}`} className="border-t border-line first:border-t-0">
                      <td className="py-2 pr-3 font-mono text-xs">{m.model}</td>
                      <td className="py-2 pr-3 text-xs text-muted">{m.provider}</td>
                      <td className="tabular py-2 pr-3 text-right text-muted">{fmtInt(m.calls)}</td>
                      <td className="tabular py-2 text-right font-medium">{fmtUsd(m.costUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted">Token counts are exact (reported by the provider). Costs are estimated from built-in list prices and may differ from your invoice.</p>
        </div>
      )}
    </Card>
  );
}

const DATA_SOURCES = [
  { name: 'crt.sh', provides: 'Certificate Transparency subdomains', key: 'No key' },
  { name: 'Cert Spotter (SSLMate)', provides: 'Second CT source, often broader', key: 'No key' },
  { name: 'HackerTarget', provides: 'Passive DNS host records', key: 'No key · ~free daily quota' },
  { name: 'Wayback Machine', provides: 'Historical hosts from the web archive', key: 'No key' },
  { name: 'Shodan InternetDB', provides: 'Open ports & CVEs per IP', key: 'Optional Shodan key for the full API' },
  { name: 'Shodan CVEDB', provides: 'CVE severity, KEV & EPSS', key: 'No key' },
  { name: 'AlienVault OTX', provides: 'Passive-DNS subdomains (threat intel)', key: 'Optional free key' },
  { name: 'GitHub code search', provides: 'Leaked secrets & references in public code', key: 'Optional GitHub token' },
];

function DataSources() {
  return (
    <Card>
      <CardTitle icon={Plug} tone="var(--color-tone-sky)">Passive data sources</CardTitle>
      <p className="mb-4 text-[13px] text-muted">Every scan reads these public OSINT sources. All are passive — Craton never touches the target directly.</p>
      <div className="flex flex-col divide-y divide-line border-y border-line">
        {DATA_SOURCES.map((d) => (
          <div key={d.name} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-center">
            <span className="text-[13px] font-medium">{d.name}</span>
            <span className="text-[13px] text-muted">{d.provides}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{d.key}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
