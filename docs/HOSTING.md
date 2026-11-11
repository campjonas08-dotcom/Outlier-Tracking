# Website and iPhone Home Screen setup

The current synthetic demo can run entirely on GitHub Pages. Your PC can be off; GitHub serves the built website over HTTPS. This is a public sample dashboard, not a private hosted banking service. No Node backend, provider secret, or real financial record is published.

## Activate hosting once

Repository administrators control this setting. Code-push access alone does not grant access to enable Pages.

1. Open [repository Pages settings](https://github.com/campjonas08-dotcom/Outlier-Tracking/settings/pages).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open [Publish website](https://github.com/campjonas08-dotcom/Outlier-Tracking/actions/workflows/website.yml), choose **Run workflow**, leave the branch as `main`, and run it. If a run is already successful, another run is unnecessary.
4. Wait for both build and deployment to succeed. The deployment output provides the actual website link. With the repository's current owner/name and no custom domain, the expected address is `https://campjonas08-dotcom.github.io/Outlier-Tracking/`.

The repository owner must enable Pages first; the deployment workflow does not grant itself administrative access. Private repositories may need a GitHub plan supporting Pages; do not change repository privacy or buy anything without the user's direction. The website itself is publicly accessible unless a supported private Pages configuration is used.

Subsequent pushes to `main` automatically run checks, build, and deploy the sample site. GitHub repository/environment policies may require owner approval for Actions or deployments. No third-party hosting account or custom domain is required. Do not describe the site as live until a successful deployment and an HTTPS page load are confirmed.

## Add it to an iPhone

After the website is live:

1. Open the **website link** in **Safari** on the iPhone (not the GitHub source-code page).
2. Tap **Share → Add to Home Screen**.
3. Leave **Open as Web App** enabled if offered, and tap **Add**.

Ledger appears on the Home Screen with its own icon and opens in standalone mode. An **Install app** button inside the dashboard repeats these instructions. Android users can use their browser's Install/Add to Home screen menu. Physical iPhone installation must be verified on the device; emulated mobile rendering is not a substitute.

This version requires Internet access. No service worker or offline financial cache is installed. Home Screen installation does not connect accounts, add authentication, or store edits.

## Developer details

`npm run build:pages` type-checks and builds with Vite's `pages` mode and base `/Outlier-Tracking/`. A build plugin emits only the explicitly fictional snapshot at `demo/dashboard.json`. The browser requests that same-origin static fixture instead of the local API. Icons and a manifest use deployment-safe relative URLs. If the repository is renamed or the host path changes, update Vite's `base` and retest.

`npm run build` remains the local/full-server build, using `/api/demo/dashboard`. Pages cannot execute the Express backend. Future authenticated financial features must use a secure backend and a separate deployment plan; never export personal records into `public`, `dist`, or the Pages fixture. Keep backend secrets out of client bundles.

Checks: `npm run lint`, `npm test`, `npm run build`, `npm run build:pages`. Build-contract tests cover asset URLs, the manifest scope, a functioning static fixture, and separation from the server build. Preview the Pages build at the **same subpath** when testing; a root-only preview can hide broken deployment paths.
