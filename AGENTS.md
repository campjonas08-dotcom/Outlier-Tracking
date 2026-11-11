# Codex project guide

## Purpose and current state

Single-user finance tracker for Outlier earnings and Synovus banking. Current version is a local synthetic-data scaffold. Read `README.md` and `docs/FEASIBILITY.md` first. Never claim live connectivity, current institution support, prices, or authorized Outlier access without official evidence and a successful relevant test.

## Workflow

Use the existing checkout. Cloud tasks already have isolation; do not create a worktree unless the user requests one. Use focused changes/commits and preserve user changes. Node 24; `npm ci`, `npm run dev`. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for relevant application changes. CI runs the same checks. Do not push or publish unless authorized.

## Architecture and conventions

- React/TypeScript + Vite + Tailwind + Recharts in `src`; Node/Express in `server`.
- Shared domain logic is framework-independent in `shared`. Strict TypeScript, descriptive names, USD integer cents. Check integer safety and avoid float arithmetic for accounting.
- `server/demo.ts` is explicitly fictional. `/api/demo/dashboard` must never return real data. Live routes do not exist.
- `db/schema.sql` is proposed SQLite design only. Do not imply persistence exists until migrations and storage are implemented/tested. PostgreSQL/Supabase is optional later.
- Income adapters implement `IncomeProvider`, declare missing capabilities, and fail closed when unsupported. No scraping, private API guessing, or session-cookie harvesting.
- Keep earnings, payouts, deposits, and available balances distinct. Cash flow uses posted deposits minus expenses net of refunds; transfers and pending transactions are excluded. Awaiting payment is an all-time stock as of snapshot, independent of the selected period.
- Source dates must be normalized to a documented reporting timezone before accounting. Current fixture has date-only reporting dates. Store source timestamps too when adding real providers.
- Sync uses provider-scoped stable IDs. Stage all pages, retry mutations from committed cursor, and commit cursor + records atomically. Pure staging helper alone is not a complete sync implementation.

## Security requirements before real data

Require authenticated access and enforce authorization server-side. Keep secrets and encrypted provider tokens on backend; never in Vite variables. Use authenticated encryption and an independently protected key. Protect sessions/CSRF, apply rate limits, use HTTPS remotely, and validate webhook signatures/replay windows. Use least-privilege database access, safe status-only logs, no response-body logging. Add disconnect/revoke and explicit local-data deletion controls before shipping live integrations. Do not store bank passwords. Credentials belong in secure environment settings or ignored local configuration, never chat or Git. Do not cache private financial responses in a service worker.

## Next milestone

Resolve research gates and price quote first. Then implement auth/storage, live banking, and an authorized earnings provider incrementally with tests. Keep mock data available independently. Update feasibility evidence and documentation as capabilities change. Existing sample dates are intentionally static; UI period controls anchor to `asOf`.
