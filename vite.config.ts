import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { demo } from './server/demo.ts';

const syntheticPagesFixture: Plugin = {
  name: 'synthetic-pages-fixture',
  generateBundle() {
    if (demo.mode !== 'demo') throw new Error('Pages may only publish synthetic data');
    this.emitFile({ type: 'asset', fileName: 'demo/dashboard.json', source: JSON.stringify(demo) });
    this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' });
  },
};

export default defineConfig(({ mode }) => ({
  // Pages serves the synthetic frontend only; never publish real records here.
  base: mode === 'pages' ? '/Outlier-Tracking/' : '/',
  plugins: [react(), tailwindcss(), ...(mode === 'pages' ? [syntheticPagesFixture] : [])],
  server: { host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:4310' } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
}));
