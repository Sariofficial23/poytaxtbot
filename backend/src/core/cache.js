import crypto from 'crypto';

// Кэш публичных данных (меню, баннеры, настройки) в памяти сервера.
// Экономит лимиты бесплатной базы: мини-апп не ходит в БД при каждом открытии.
const store = new Map();
const TTL = 10 * 60 * 1000;

export async function cached(key, loader) {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const value = await loader();
  store.set(key, { value, at: Date.now() });
  return value;
}

export function invalidate(...keys) {
  if (!keys.length) store.clear();
  else keys.forEach((k) => store.delete(k));
}

// base64-картинки из базы отдаём отдельными URL с долгим кэшем в браузере
const images = new Map(); // `${kind}/${id}` → { buf, type, v }

export function publicImage(kind, id, image) {
  if (!image || !image.startsWith('data:')) return image || null;
  const m = image.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return null;
  const v = crypto.createHash('md5').update(image).digest('hex').slice(0, 10);
  images.set(`${kind}/${id}`, { buf: Buffer.from(m[2], 'base64'), type: m[1], v });
  return `/api/img/${kind}/${id}?v=${v}`;
}

export const getImage = (kind, id) => images.get(`${kind}/${id}`);
