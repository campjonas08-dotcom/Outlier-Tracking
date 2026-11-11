# Integration feasibility and architecture

Research attempt: November 10, 2026 (America/Chicago). This is an initial assessment, **not confirmation of live integration support**.

## Evidence and outstanding research

The selected GitHub repository was empty. No provider credentials or runtime variable bindings were configured in the cloud environment. Direct HTTPS requests to the official [Plaid pricing](https://plaid.com/pricing/) and [Outlier terms](https://outlier.ai/legal/terms-of-use) destinations returned proxy CONNECT 403 responses. The pages were not retrieved; their contents were not reviewed. Custom domain additions for `plaid.com` and `outlier.ai` were saved in the environment draft. Saving that draft does not apply access. No production account authorization, account connection, or billable API request was attempted.

The official [Plaid OpenAPI repository](https://github.com/plaid/plaid-openapi) was reachable through the permitted GitHub route. Its README and [API specification](https://github.com/plaid/plaid-openapi/blob/master/2020-09-14.yml) were retrieved and inspected. The specification confirms documented `/institutions/get_by_id`, `/link/token/create`, `/transactions/sync`, and `/accounts/balance/get` operations, plus the requirement to restart an entire pagination loop from its original cursor on `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`. This confirms relevant API capabilities in general, not production eligibility, Synovus support, or price. Neither `Synovus` nor `ins_107810` appeared in the downloaded specification; it is not an institution directory, so this does not establish absence of support.

| Question | Finding | Verification still required |
| --- | --- | --- |
| Is Synovus Personal available through Plaid? | Unverified. `ins_107810` is a lead supplied in the handoff, not a validated current institution ID. | With a Plaid developer account, use the official institutions API/Link search in the intended environment and region. Confirm checking accounts, Transactions product, OAuth/reconnection behavior, and actual Link availability. Sandbox success is not production verification. |
| Can balances and transactions be automated? | Plaid is the proposed route; no live implementation or connectivity test exists. | Confirm current product documentation, enabled products, institution support, balance freshness, and production access. |
| Is there an official Outlier contributor earnings API? | No authorized endpoint was verified. Absence of verification is not proof that no API exists. | Consult official contributor documentation/support and obtain explicit authorization before implementation. |
| Can notification emails supply earnings? | Candidate fallback, not verified. | Obtain consent and inspect supported notification formats using redacted examples. Payout notices may omit earned-but-unpaid balances entirely. |
| Can browser automation solve Outlier access? | Disabled. No terms or authorization have been verified. | Explicit permission, current terms review, secure session storage. Never infer authorization from visible internal endpoints. |

### Research sequence for the next session

1. Apply the domain additions through environment settings and retry official documentation with TLS verification enabled. Add specific redirected hosts only if observed and required.
2. Review the current Plaid institution, Transactions Sync, Balance, Link, pricing, and production-access documentation from the official site. Verify Synovus in the intended production environment with account authorization; institution IDs can vary or become unavailable. Do not hardcode the handoff ID as validated.
3. Ask Outlier support about documented contributor earnings access. Proceed through official API, explicitly authorized alternative, then consented email parsing, in that order. No scraping is implemented. If only payouts are available, show unpaid earnings as **unknown**, never zero or an inferred fact.
4. Record official sources, access dates, actual quotes, product limitations, and successful test evidence here. Credential values belong in ignored local configuration or a supported secret store, never this report.

## Cost assessment

| Component | Initial cost assumption | Qualification |
| --- | --- | --- |
| Local React/Node app with synthetic data | $0 in service subscriptions | Uses an existing computer; electricity and Internet are not included. No commercial service is contacted at runtime. |
| Local SQLite persistence (future) | $0 hosting subscription | Single-user, low-volume option; backups and OS/disk encryption remain the user's responsibility. Not implemented yet. |
| Plaid sandbox | Budget as development-only; current terms unverified | Sandbox cannot demonstrate Synovus production connectivity or carry real bank data. |
| Plaid production | **Unknown; quote required** | Do not assume personal use is free. Verify usage-based fees, product minimums, account/item charges, refresh frequency, and production eligibility with Plaid. No verified numeric price is available. |
| Outlier integration | **Unknown** | Official access and any fees are unverified. Email provider API access may have quotas or fees. |
| Hosting, Supabase/PostgreSQL | $0 initially by omitting them | Remote hosting, domain, backups, database and auth subscriptions are optional future expenses, not included in this scaffold. |

There is no defensible total price for live automation yet. The lowest-cost **confirmed working** workflow is the local synthetic demo at $0 in recurring service fees. Automated live banking remains a conditional proposal until access and a quote are verified.

## Recommended architecture

Use one repository, one npm installation, React + Vite + Tailwind + Recharts, and a small Express TypeScript backend. Bind to loopback. Keep integer cents and pure accounting functions shared between the server and UI. A provider interface isolates Outlier access. Local development needs neither Docker nor a cloud database.

For a single local user, prefer SQLite when persistence is added; a proposed relational schema is in `db/schema.sql`. Introduce authenticated single-user sessions and encrypted provider-token storage **before any real data is stored or served**. Use OS-protected key material, never a key committed beside the database. A production token encryption implementation must support authenticated encryption, rotation, and account disconnection/revocation. A remotely accessible version needs HTTPS, authentication, CSRF protection, rate limiting, backups, and an access review. Supabase Auth/PostgreSQL is an optional later alternative when remote access justifies it. The current public `/api/demo/dashboard` endpoint is exclusively a synthetic fixture and must never be repurposed for real records.

## Integration implementation plan

- **Plaid:** server creates Link tokens and exchanges public tokens; bank passwords are handled only by Plaid Link. Encrypt access tokens on the backend. Cache available and current balances separately, preserving null available balances. Implement Transactions Sync pagination, provider-scoped unique IDs, modifications, removals, pending-to-posted replacement, and atomic records/cursor commits. On mutation-during-pagination errors, restart from the previously committed cursor. Never advance the stored cursor after a partial failure.
- **Sync lifecycle:** use a local scheduler while the process is running plus explicit refresh, with backoff and safe status logs. Sleeping/offline Windows machines cannot promise continuous updates. Verified webhooks can trigger sync for a future deployed backend; verify signatures/replay defenses according to current provider documentation before enabling them.
- **Outlier:** authorized adapters expose capabilities and limitations, including whether unpaid earnings are observable. Email payouts alone must not be treated as full earnings. The current adapter fails closed. No credentials, sessions, or private endpoints are used.
- **Reconciliation:** earnings and deposits are distinct records. Match payouts to posted deposits with explicit allocations and auditability; do not automatically match on amount alone. Preserve reversals and adjustments. Income metrics must never add deposits to their underlying earnings.
- **Disconnect/delete:** revoke provider access where supported, delete local encrypted tokens, stop sync, and offer explicit financial-record deletion. Not implemented in this scaffold; connections are unavailable rather than simulated.

## What is delivered now

Phases 1–2 foundation with a working mock dashboard: Node backend, React UI, period filters, search, charts, exact-cent calculations, pure sync staging logic, sample data, tests, CI, documentation, and proposed database schema. Research is incomplete due to confirmed network restrictions; production support, prices, and Outlier authorization remain external verification gates. There is no authentication, persistence, live synchronization, PWA/offline cache, production deployment, or real-data security readiness yet. Do not enter actual financial records into this version.
