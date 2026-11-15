'use client';

import { BellRing, Bot, Check, Copy, GitBranch, KeyRound, Loader2, Plug, Radar, ServerCog, Sparkles, Trash2, UserPlus, Users as UsersIcon, Webhook, type LucideIcon } from 'lucide-react';
import { IconTile } from '@/components/ui/icon-tile';
import { useCallback, useEffect, useState } from 'react';
import { PasswordForm } from '@/components/password-form';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

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
  GITHUB_TOKEN: { icon: GitBranch, tone: 'var(--color-tone-violet)' },
  ALERT_WEBHOOK_URL: { icon: Webhook, tone: 'var(--color-tone-sky)' },
};

const SECRETS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API key', help: 'Primary model for triage and the executive brief.' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API key', help: 'Used when no OpenAI key is set, or when the provider is Anthropic.' },
  { key: 'SHODAN_API_KEY', label: 'Shodan API key', help: 'Optional. Without it the free InternetDB is used for ports and CVEs.' },
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
      <main className="mx-auto flex max-w-[920px] flex-col gap-5 px-4 pb-20 pt-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-tight">Administration</h1>
          <p className="mt-0.5 text-muted">Backend services, operator accounts and your own password.</p>
        </div>
        <ServiceSettings />
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
              <label htmlFor="model" className="label">Model ID (blank = default)</label>
              <input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-5-mini / claude-haiku-5-5" spellCheck={false} className="field font-mono" />
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
          <p className="hint max-w-[70ch]">Keys are encrypted before they are stored and are never sent back to the browser. A key saved here overrides the matching environment variable.</p>
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
                <th key={h} className="border-b border-line px-3 py-2.5 text-left text-xs font-medium text-muted first:pl-0">{h}</th>
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
