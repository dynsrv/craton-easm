# Craton EASM

Zero-integration External Attack Surface Management for Indonesian enterprises. Give it a root domain (`company.co.id`) and it maps what an outsider can see: forgotten subdomains, exposed staging and admin portals, expiring certificates, open database ports and known CVEs. An LLM then triages every asset and writes a one-page bilingual brief (English / Bahasa Indonesia).

No VPN, cloud keys or agents are needed. The scanner only uses public sources and one ordinary `GET /` per host.

## Quick start

```bash
npm install            # also generates the Prisma client
cp .env.example .env   # set AUTH_SECRET and ADMIN_EMAIL
npm run db:push        # creates prisma/dev.db (SQLite) or syncs Postgres
npm run dev            # http://localhost:3000
```

Sign in with `ADMIN_EMAIL`. The one-time password is `ADMIN_INITIAL_PASSWORD` if you set it; otherwise a random one is printed to the server log at the first sign-in attempt. You must choose a new password before anything else is reachable.

Terminal-only scan, without the UI or database:

```bash
npm run scan -- company.co.id > result.json
```

Requires Node 20 or newer.

### Environment

| Variable | Needed | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` (SQLite, local) or a Postgres URL (Neon, Supabase) |
| `AUTH_SECRET` | yes | 32+ random characters. Signs sessions and encrypts keys saved in `/admin` |
| `ADMIN_EMAIL` | yes | First administrator, created when the user table is empty |
| `ADMIN_INITIAL_PASSWORD` | optional | One-time password for that first administrator |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_PROVIDER`, `TRIAGE_MODEL`, `SHODAN_API_KEY` | optional | Can be set here or in `/admin`; the admin page wins |

With no LLM key the app still works: triage falls back to the rule engine in `lib/ai/heuristic.ts`, and the dashboard says so.

## v2 security modules

| Module | File | What it does |
| --- | --- | --- |
| Dangling DNS and takeover | `lib/scanner/takeover.ts` | Finds CNAMEs pointing at cloud/SaaS providers (S3, Azure, GitHub Pages, Heroku, Vercel, Netlify, Shopify, Fastly and more) whose resource is gone: NXDOMAIN on the target, or the provider's "unclaimed" page from one GET. Severity follows the provider's status on [can-i-take-over-xyz](https://github.com/EdOverflow/can-i-take-over-xyz): vulnerable = Critical, edge case = High, not vulnerable = Medium. Review that list periodically. |
| Visual triage | `lib/scanner/visual-triage.ts` | Up to 15 priority hosts are opened in headless Chromium (1280x800, 8 s each, fresh context, downloads and service workers off, requests to private addresses blocked). A vision model classifies each page (admin/DevOps panel, unauthenticated API docs, login portal, default/parked page, marketing site) and notes anomalies; without an AI key a rule-based classifier is used. Screenshots are kept for the 3 latest scans per domain. |
| Leaks and cloud storage | `lib/scanner/exposure-leaks.ts` | GitHub code search (needs a GitHub token) for the domain and internal hostnames in `.env`, `config.json`, `docker-compose.yml`; every fragment is redacted in memory by `lib/redact.ts` before storage or LLM use. One HTTP HEAD per bucket name (`org`, `org-public`, `org-assets`, `org-backup`, `org-dev`, `org-static`) on AWS S3, Google Cloud Storage and Alibaba OSS Jakarta; 200 = anonymous listing allowed. Nothing is listed or downloaded. SPF and DMARC are read over DNS-over-HTTPS. |
| Attack paths | `lib/ai/attack-paths.ts` | Chains findings into the 2-3 most plausible breach routes as nodes and edges, each with a "break the chain here" control. Steps describe what an attacker reaches, never how. Rule-based paths are used without an AI key. |
| Drift | `lib/scanner/drift.ts` | Each scan stores a `ScanSnapshot`; the next scan of the domain records `DriftEvent`s for new hosts and ports, expired or expiring (<14 days) certificates, weakened SPF/DMARC, new takeovers, newly public buckets and new code references. High and critical events are POSTed as JSON to the alert webhook (Slack- and Teams-compatible `text` field included). |

**Continuous monitoring.** Turn on "Monitor daily" for a domain on the dashboard. Vercel Cron calls `/api/cron/monitor` once a day (`vercel.json`), authenticated with `CRON_SECRET`, and re-scans up to 3 due domains per run.

**New settings (Admin page).** `GITHUB_TOKEN` (a fine-grained token with no repository access is enough for code search) and `ALERT_WEBHOOK_URL` (HTTPS only, must resolve to a public address), with a "Send test alert" button.

**New environment variable.** `CRON_SECRET`: random string; Vercel sends it with each cron request.

**Headless Chromium.** On Vercel the app uses `@sparticuz/chromium` with `playwright-core`. Locally it uses an installed Chrome (or `CHROME_PATH`); if none is found, visual triage falls back to HTTP metadata and the scan continues.

## Admin page

`/admin` is where an operator manages the backend without redeploying:

- **AI and data services.** Provider, model ID, OpenAI / Anthropic / Shodan keys, and a "Test AI connection" button. Keys are AES-256-GCM encrypted with `AUTH_SECRET` before they reach the database and are never returned to the browser (only the last 4 characters).
- **Administrators.** Add an account by email; a random one-time password is shown once. Remove accounts (not your own).
- **Your password.** Minimum 12 characters.

Sessions are 12-hour signed cookies (HttpOnly, SameSite=Lax, Secure in production). Five failed sign-ins lock an account for 15 minutes. Every page and API route except `/login` requires a session.

## Deploying to Vercel

1. Add a Postgres database to the project (Vercel dashboard, Storage, Neon). It injects `DATABASE_URL`.
2. Set `AUTH_SECRET`, `ADMIN_EMAIL` and optionally `ADMIN_INITIAL_PASSWORD`.
3. Deploy. `npm run build` runs `prisma db push` against the database, then `next build`.

`scripts/prisma.mjs` picks the schema from `DATABASE_URL`: a `file:` URL gets a SQLite copy of `prisma/schema.prisma`, anything else uses it as written (PostgreSQL). Schema pushes use `DATABASE_URL_UNPOOLED` when the provider supplies one.

## Project structure

```
middleware.ts                 session check, forced password change, CSRF origin check
app/
  page.tsx                    dashboard
  login/, change-password/    sign-in and first-login password screens
  admin/page.tsx              admin page
  report/[id]/page.tsx        1-page executive report, print-optimised
  api/scans/route.ts          POST start a scan, GET recent scans
  api/scans/[id]/route.ts     GET status + log + assets (polled), DELETE
  api/auth/*                  login, logout, password
  api/admin/settings, users   backend settings (+ /test), administrator accounts
components/
  top-bar.tsx, brand.tsx      shared navigation and wordmark
  admin-panel.tsx             services, administrators, password
  login-form.tsx, password-form.tsx, first-password.tsx
  dashboard.tsx               scan form, progress, summary, filters, table
  asset-drawer.tsx            evidence + remediation drawer
  report-view.tsx             A4 report with EN/ID toggle and window.print()
  score-gauge.tsx
  ui/                         shadcn-style primitives (button, card, badge)
lib/
  scanner/
    index.ts                  PHASE A orchestrator: discover(domain)
    crtsh.ts                  Certificate Transparency lookup + normalisation
    dns.ts                    resolution, wildcard detection, prefix fallback, hosting fingerprint
    http-probe.ts             GET / with TLS inspection, in-scope redirects only
    internetdb.ts             Shodan InternetDB / host API
    domain.ts                 input validation, scope and public-IP guards
  ai/
    schema.ts                 Zod: AssetTriageSchema, TriageBatchSchema, ExecutiveBriefSchema
    triage.ts                 PHASE B triageAssets() + PHASE C generateBrief()
    heuristic.ts              deterministic fallback triage and brief
  auth/                       password hashing (scrypt), sessions (JWT), guard, first-run admin
  settings.ts                 encrypted settings, runtime config (database over env)
  run-scan.ts                 pipeline + persistence + DTO mapping
  score.ts                    Attack Surface Score
  i18n.ts                     EN / ID dictionary
  ports.ts, types.ts, db.ts, utils.ts
prisma/schema.prisma
scripts/scan.ts               CLI runner
scripts/prisma.mjs            schema selection for generate / db push
```

## Pipeline

1. **Certificate Transparency.** `crt.sh/?q=%.{domain}&output=json`, deduplicated, wildcards and e-mail SANs dropped. Retries once.
2. **DNS.** `resolve4` + `resolveCname` + reverse lookup, concurrency 8. Dead records are dropped. Hosting is fingerprinted from CNAME, Cloudflare ranges and PTR (AWS, GCP, Azure, Alibaba Cloud, Cloudflare, and Indonesian providers such as Biznet Gio, IDCloudHost, Telkom).
3. **HTTP / TLS.** Top 50 hosts (interesting names first), 5 s timeout, concurrency 8. One `GET /` over HTTPS, then HTTP. Captures status, `<title>`, password inputs, `Server`, `X-Powered-By`, HSTS, CSP, certificate trust and days to expiry.
4. **Ports and CVEs.** One Shodan lookup per unique IP. Shared CDN edges are skipped because their ports describe the CDN.
5. **AI triage.** Batches of 10 through the Vercel AI SDK with a strict Zod schema. Each asset gets a category, severity, `exposureReasoning` and `remediationStep` in both languages.
6. **Brief.** Attack Surface Score and Top 3 Immediate Fixes.

**Score.** `round(100 * exp(-penalty / 60))`, with penalties Critical 12, High 5, Medium 2, Low 0.5. 100 means nothing to fix. Bands: 80+ well managed, 60-79 moderate, 40-59 high, under 40 critical exposure.

**crt.sh fallback.** If crt.sh times out or rate-limits, discovery checks these prefixes through DNS: `www api dev staging uat portal admin vpn mail sso erp hris app mobile cms sandbox`. A random-label lookup detects wildcard DNS first so that wildcard zones do not produce 16 false hosts.

## Guardrails built in

- Passive OSINT and standard `GET` only. No port scanning (ports come from Shodan's data), no directory guessing, no login attempts, no payloads.
- **Authorisation check.** The API rejects scans without `authorized: true`; the UI has a checkbox.
- **SSRF protection.** Hosts resolving to private, loopback or link-local addresses are never probed, connections are pinned to the vetted IP, and redirects are followed only inside the scanned domain.
- **Prompt-injection hardening.** Page titles and headers are passed to the LLM as untrusted data, output must match the Zod schema, and anything the model skips is triaged by rules.
- One active scan per domain; 96 KB body cap; hard per-request deadline.

## Notes for production

- **Structured output API.** The AI SDK deprecated `generateObject` in v6. `lib/ai/triage.ts` uses the current form, `generateText` with `Output.object({ schema })`, which does the same Zod-validated JSON generation.
- **Long scans.** `POST /api/scans` responds immediately and runs the pipeline with `after()`. That is fine on `next dev` / `next start` and on hosts that allow 5-minute functions. For many concurrent scans move `runScan` to a queue worker.
- **Schema changes.** `prisma db push` is fine for an MVP. Switch to `prisma migrate` before the data matters.
- **Email.** One-time passwords are shown on screen, not emailed; add a mail provider if you want delivery by email.
- **PDF export.** The report page prints to exactly one A4 page (`@media print`); "Export PDF" opens the browser print dialog.
- **Legal.** Scan only domains you own or have written permission to assess, and keep that permission on file for lead-generation scans.
