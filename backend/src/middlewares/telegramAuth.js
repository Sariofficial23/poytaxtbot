import crypto from 'crypto';
import config from '../config/default.js';

// Проверка подписи Telegram WebApp initData
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) {
    return null;
  }

  try {
    return JSON.parse(params.get('user') || 'null');
  } catch {
    return null;
  }
}

export function telegramAuth(req, res, next) {
  let user = verifyInitData(req.get('X-Telegram-Init-Data'), config.botToken);

  // Локальная разработка в браузере без Telegram
  if (!user && !config.isProduction && config.devTelegramId) {
    user = { id: Number(config.devTelegramId), first_name: 'Dev' };
  }

  if (!user?.id) return res.status(401).json({ error: 'Telegram orqali kiring' });
  req.tgUser = user;
  next();
}
