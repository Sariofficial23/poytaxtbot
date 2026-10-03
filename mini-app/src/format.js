export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/[\s,  ]/g, ' ')} so'm`;

export function categoriesOf(products) {
  const seen = [];
  for (const p of products) if (!seen.includes(p.category)) seen.push(p.category);
  return seen;
}

export const DEFAULT_SETTINGS = { freeFrom: 100000, deliveryFee: 8000, colaPrice: 5000 };

// Пресеты цвета баннеров (ключи совпадают с админкой) — тёплая восточная палитра
export const GRADIENTS = {
  red: 'linear-gradient(135deg,#1d3350,#2f5580)',
  orange: 'linear-gradient(135deg,#8a5a1c,#cfa550)',
  gold: 'linear-gradient(135deg,#a77a2c,#e2bd6b)',
  pink: 'linear-gradient(135deg,#6b2f45,#a8566e)',
  dark: 'linear-gradient(135deg,#0f1c2d,#243f5e)',
  green: 'linear-gradient(135deg,#1f4d47,#3f7d70)',
};
