import config from '../config/default.js';

const INTERVAL = 10 * 60 * 1000;

// Бесплатный Render засыпает после 15 минут простоя — пингуем свой /health
export function startKeepAlive() {
  if (!config.renderExternalUrl) return;
  const url = `${config.renderExternalUrl.replace(/\/$/, '')}/health`;
  setInterval(async () => {
    try {
      await fetch(url);
    } catch (e) {
      console.warn('[keep-alive] ping failed:', e.message);
    }
  }, INTERVAL);
  console.log(`⏰ Keep-alive: ${url}`);
}
