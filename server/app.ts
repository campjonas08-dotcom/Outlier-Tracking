import express from 'express';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { demo } from './demo.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'demo' }));
  // This public endpoint serves SYNTHETIC data only. Real financial routes require auth first.
  app.get('/api/demo/dashboard', (_req, res) => res.json(demo));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint unavailable' }));
  const web = resolve('dist');
  if (existsSync(web)) app.use(express.static(web));
  return app;
}
