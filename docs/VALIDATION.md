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

## Website and Home Screen follow-up

- `npm run lint`, `npm run build` (including type checking), and `npm run build:pages` passed. The existing non-fatal large-chunk warning remains.
- `npm test`: **17 tests passed** across four files, including new production build-contract tests for Pages asset paths, manifest scope/icons, the static fixture, and server/static-build separation.
- The static Pages build was served locally under `/Outlier-Tracking/` by a separate server with no financial API routes. Chromium mobile checks covered the actual static data request, daily filtering, transaction search, the install-instructions dialog, 390 px page overflow, manifest parsing, PNG dimensions, the Apple icon, and network error/retry. No runtime errors were observed. Physical iPhone installation remains untested.
- The Pages workflow uses official GitHub configuration, artifact, and deployment actions; actual deployment is not confirmed by these local checks. GitHub API requests and the expected website host returned proxy CONNECT 403 responses, preventing repository-admin setup and external website verification from this environment. Additional domains `api.github.com` and `campjonas08-dotcom.github.io` were saved to the cloud draft, preserving previous domain requirements; the save alone does not apply access.
- See `HOSTING.md` for the one-time repository Pages setting and workflow activation. Do not call the public URL live until deployment is confirmed.
