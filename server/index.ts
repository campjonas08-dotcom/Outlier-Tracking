import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4310);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid PORT');
const server = createApp().listen(port, '127.0.0.1', () => {
  console.log(`Synthetic demo API listening on loopback port ${port}`);
});
server.on('error', () => { console.error('Server failed to start'); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close());
