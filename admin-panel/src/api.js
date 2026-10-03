const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Фото меню с сервера приходят как /api/... — добавляем адрес backend
export const imgSrc = (src) => (src?.startsWith('/api/') ? `${BASE}${src}` : src);
const KEY = 'dk_admin_password';

export const getPassword = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};
export const setPassword = (p) => {
  try {
    if (p) localStorage.setItem(KEY, p);
    else localStorage.removeItem(KEY);
  } catch {}
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function request(path, { method = 'GET', body, password } = {}) {
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password ?? getPassword() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && password === undefined) onUnauthorized();
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

export async function checkPassword(password) {
  try {
    await request('/ping', { password });
    return true;
  } catch {
    return false;
  }
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  orders: (range) => request(`/orders${qs(range)}`),
  setOrderStatus: (id, status) => request(`/orders/${id}`, { method: 'PATCH', body: { status } }),

  products: () => request('/products'),
  createProduct: (d) => request('/products', { method: 'POST', body: d }),
  updateProduct: (id, d) => request(`/products/${id}`, { method: 'PUT', body: d }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  seed: () => request('/seed', { method: 'POST' }),

  banners: () => request('/banners'),
  createBanner: (d) => request('/banners', { method: 'POST', body: d }),
  updateBanner: (id, d) => request(`/banners/${id}`, { method: 'PUT', body: d }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE' }),

  promos: () => request('/promos'),
  createPromo: (d) => request('/promos', { method: 'POST', body: d }),
  updatePromo: (id, d) => request(`/promos/${id}`, { method: 'PUT', body: d }),
  deletePromo: (id) => request(`/promos/${id}`, { method: 'DELETE' }),

  couriers: (range) => request(`/couriers${qs(range)}`),

  settings: () => request('/settings'),
  saveSettings: (d) => request('/settings', { method: 'PUT', body: d }),
  testCourier: () => request('/test-courier', { method: 'POST' }),
};
