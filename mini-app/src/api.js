import { getInitData } from './telegram.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  return data;
}

// Картинки с сервера приходят как /api/img/... — добавляем адрес backend
const withImage = (list) =>
  list.map((x) => (x.image?.startsWith('/api/') ? { ...x, image: `${BASE}${x.image}` } : x));

export const getProducts = () => request('/products').then(withImage);
export const getBanners = () => request('/banners').then(withImage);
export const getSettings = () => request('/settings');
export const checkPromo = (code, amount) =>
  request('/promo/check', { method: 'POST', body: JSON.stringify({ code, amount }) });
export const createOrder = (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) });
export const getMyOrders = () => request('/orders/my');
