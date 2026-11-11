# Ledger — Outlier finance tracker

A local-first personal finance foundation for comparing Outlier earnings with Synovus bank activity. **This version is a synthetic demo. No accounts are connected.** It does not accept banking credentials or real financial data.

## Use as a website or phone app

The sample dashboard is prepared for GitHub Pages with automatic deployment and iPhone **Add to Home Screen** support. Hosting must be enabled in the repository before the website becomes available. See [hosting and phone installation](docs/HOSTING.md) for the activation steps and website address. Once deployed, your computer does not need to stay on.

The public website contains fictional data only. It requires Internet access; no offline financial cache or live backend is hosted on Pages.

## Start locally (Windows, macOS, Linux)

Install [Node.js 24 LTS](https://nodejs.org/) and Git. In PowerShell or a terminal:

```sh
git clone https://github.com/campjonas08-dotcom/Outlier-Tracking.git
cd Outlier-Tracking
npm ci
npm run dev
```

Open the local address printed by Vite (normally port 5173). Both the frontend and backend start together. The backend uses loopback port 4310; the Vite proxy expects that port. No `.env` is needed. If you change `PORT` via an ignored `.env`, update the development proxy in `vite.config.ts` too. Stop both processes with Ctrl+C. No database, Docker, Supabase, or provider account is required for the demo.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

The last two commands build and serve the app from the repository root on loopback port 4310. This is a local demo server, not a production deployment configuration. Health endpoint: `/api/health`. The fixture endpoint is `/api/demo/dashboard`; live financial routes are unavailable. Node's optional `.env` loading works on Windows without shell-specific syntax.

## What works

- Responsive dashboard with six summary metrics, deposited-income/spending chart, category totals, period/date filters, transaction search, connection limitations, and error/retry states.
- Fictional snapshot dated November 10, 2026. Period controls are anchored to that snapshot, not today's date. USD only.
- Exact integer-cent calculations, refunds and reversals, pending/posted separation, and transfer exclusions. Outstanding earnings are an all-time snapshot; income and spending use the selected period. Projected balance is an estimate, not spendable cash.
- Pure incremental-sync staging with replay-safe upserts, removals, and pending replacement. No provider fetch or database cursor persistence exists yet.
- Vitest accounting/sync/API tests and GitHub Actions lint/typecheck/test/build configuration.

## Structure

```text
src/                     React UI and styles
server/                  Loopback Express API and synthetic fixture
server/providers/        Replaceable income-provider contract
shared/                  Domain types, cents accounting, sync staging
tests/                   Financial, sync, and API behavior tests
db/schema.sql            Proposed SQLite schema, not applied at runtime
docs/FEASIBILITY.md       Research evidence, costs, limitations, next steps
AGENTS.md                Instructions for future Codex work
```

## Integration feasibility and next steps

Read [the feasibility report](docs/FEASIBILITY.md) before implementing external connections. Synovus support, the supplied institution ID, production pricing, and an authorized Outlier earnings source have **not** been verified. Official-site requests were blocked by the cloud network policy. Domain additions are saved in the cloud environment draft for review. There is no live integration or verified recurring-price quote.

Next: verify official access and costs; implement authentication and secure storage; add persistence; implement read-only Plaid Link/sync/disconnect; then an authorized Outlier adapter and payout reconciliation. Actual available balance must come from the provider; do not substitute current balance when it is absent. Never add earnings and matching bank deposits together as new income.

## Privacy and security boundary

The public demo route contains fictional data only. Do not replace the fixture with actual bank records. Secrets stay server-side; `VITE_*` variables are public. `.env`, local databases, logs, and generated builds are ignored. Never send passwords or tokens through chat, issues, commits, or CI logs. GitHub Pages hosts only the synthetic sample frontend; it must never host actual financial records or be presented as a live banking app. Authentication, token encryption, webhook validation, account revocation, deletion, and least-privilege storage must be implemented and tested before enabling real data. No service worker caches financial responses.

There is no saved-state storage yet: filters reset on reload and all data comes from the fixture. The schema is a design starting point, not a migration engine. Windows and iPhone browser compatibility require testing on those devices; Linux build/API checks do not establish native-device validation.

The toolchain uses a `minimatch` override to the patched 11.x release for GHSA-g3hv-75wg-m249 (development-tool glob amplification). Lint, type checking, tests, and build must pass when refreshing it. Remove the override when upstream dependencies require the patched version themselves.
