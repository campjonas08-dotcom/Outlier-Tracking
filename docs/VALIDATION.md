# Initial scaffold validation

Validated in the Linux cloud environment with Node.js 24.22.1 and npm 11.9.0.

- Clean lockfile installation: `npm ci` passed.
- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed (also runs inside `npm run build`).
- `npm test`: 3 test files, **15 tests passed**, none skipped. Covers financial calculations, refunds/reversals, payout double-counting, pending transactions, transfers, missing available balances, integer safety, sync replay/modifications/removals/pending replacement, API fixture behavior, absent live routes, and fail-closed Outlier access.
- `npm run build` passed. Non-fatal warning: approximately 602 kB minified application chunk (179 kB gzip); chart splitting is a future performance improvement.
- `npm audit`: zero known vulnerabilities after toolchain upgrades and the documented patched minimatch override. An audit is point-in-time, not a security certification.
- Built server (`npm start`) served the synthetic API and frontend; Chromium checks passed for rendered balances, daily/monthly filters, search, invalid custom dates, connection information, and mobile page overflow.
- After stopping the built server, `npm run dev` started both services with the updated toolchain. Chromium checks passed through the Vite proxy for sample balances, both chart series, weekly filtering, refund search, the connection dialog, and a 390 px mobile viewport. No browser runtime errors were observed. This is Linux Chromium viewport testing, not physical iPhone or Windows validation.
- Proposed `db/schema.sql` executed successfully against an in-memory SQLite database; 11 tables created with no foreign-key violations. No application persistence is implemented or claimed.

GitHub Actions is configured; its remote run status must be checked on GitHub. The checks above were executed locally before the initial scaffold commit. No live provider connection, production pricing, Outlier authorization, authentication, token encryption, webhook, or real-data validation has been completed. See `FEASIBILITY.md` for evidence and blocked research.

Cloud configuration draft saves confirmed: repository mapping, installation commands, startup/readiness instructions, and custom domain additions `plaid.com` and `outlier.ai`. Saving does not apply network access, publish a snapshot, or establish fresh-task restoration. The user must review/save settings and publish when ready.
