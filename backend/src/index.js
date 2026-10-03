import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import config from './config/default.js';
import { ensureDatabase } from './database/connection.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { startBot } from './core/bot.js';
import { startKeepAlive } from './core/keepAlive.js';

process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Фото меню из репозитория (backend/public/menu)
app.use(
  '/api/menu-img',
  express.static(fileURLToPath(new URL('../public/menu', import.meta.url)), { maxAge: '30d' })
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/admin', adminRoutes);
app.use('/api', clientRoutes);

app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Server xatosi' });
});

async function main() {
  try {
    await ensureDatabase();
    console.log('✅ Database ready');
  } catch (e) {
    console.error('❌ Database init failed:', e.message);
  }

  app.listen(config.port, () => console.log(`🚀 API on port ${config.port}`));
  startBot();
  startKeepAlive();
}

main();
