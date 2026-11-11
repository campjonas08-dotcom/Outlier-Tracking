import { afterAll, expect, it } from 'vitest';
import { build } from 'vite';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const temporary = await mkdtemp(join(tmpdir(), 'ledger-website-'));
afterAll(() => rm(temporary, { recursive: true, force: true }));

it('builds a standalone Pages site with subpath-safe assets and only synthetic data', async () => {
  const outDir = join(temporary, 'pages');
  await build({ mode: 'pages', logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    expect(match[1]).toMatch(/^\/Outlier-Tracking\//);
    expect((await stat(join(outDir, match[1].replace('/Outlier-Tracking/', '')))).isFile()).toBe(true);
  }
  const fixture = JSON.parse(await readFile(join(outDir, 'demo/dashboard.json'), 'utf8'));
  expect(fixture.mode).toBe('demo');
  expect(fixture.transactions).toHaveLength(11);
  expect(fixture.availableCents).toBe(428650);
  const assets = await readdir(join(outDir, 'assets'));
  const js = (await Promise.all(assets.filter(p => p.endsWith('.js')).map(p => readFile(join(outDir, 'assets', p), 'utf8')))).join('');
  expect(js).toContain('/Outlier-Tracking/demo/dashboard.json');
  expect(js).not.toContain('/api/demo/dashboard');
  const manifest = JSON.parse(await readFile(join(outDir, 'manifest.webmanifest'), 'utf8'));
  const manifestURL = 'https://example.test/Outlier-Tracking/manifest.webmanifest';
  expect(new URL(manifest.start_url, manifestURL).pathname).toBe('/Outlier-Tracking/');
  expect(new URL(manifest.scope, manifestURL).pathname).toBe('/Outlier-Tracking/');
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) expect((await stat(join(outDir, icon.src))).size).toBeGreaterThan(0);
}, 30000);

it('keeps ordinary server builds separate from the public demo export', async () => {
  const outDir = join(temporary, 'server');
  await build({ mode: 'production', logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  await expect(stat(join(outDir, 'demo/dashboard.json'))).rejects.toThrow();
  expect(await readFile(join(outDir, 'index.html'), 'utf8')).toContain('href="/manifest.webmanifest"');
}, 30000);
