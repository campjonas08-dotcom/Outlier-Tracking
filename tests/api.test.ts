import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../server/app';
import { OutlierProvider } from '../server/providers/income';

let server: Server;
let base: string;
beforeAll(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test address');
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
it('serves the synthetic fixture and forbids caching', async () => {
  const response = await fetch(`${base}/api/demo/dashboard`);
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(data.mode).toBe('demo');
  expect(data.transactions).toHaveLength(11);
});
it('does not expose a live financial data or credential route', async () => {
  expect((await fetch(`${base}/api/accounts`)).status).toBe(404);
  expect((await fetch(`${base}/api/plaid/token`)).status).toBe(404);
});
it('fails closed for unconfigured Outlier access', async () => {
  await expect(new OutlierProvider().fetchEarnings()).rejects.toThrow('no authorized earnings integration');
});
