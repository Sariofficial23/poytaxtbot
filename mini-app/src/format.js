export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/[\s,  ]/g, ' ')} so'm`;

export function categoriesOf(products) {
  const seen = [];
  for (const p of products) if (!seen.includes(p.category)) seen.push(p.category);
  return seen;
}

export const DEFAULT_SETTINGS = { freeFrom: 100000, deliveryFee: 8000, colaPrice: 5000 };

// Пресеты цвета баннеров (ключи совпадают с админкой) — тёплая восточная палитра
export const GRADIENTS = {
  red: 'linear-gradient(135deg,#9e3f1c,#c8643a)',
  orange: 'linear-gradient(135deg,#c26a2b,#e3a35a)',
  gold: 'linear-gradient(135deg,#a77a2c,#d9b56a)',
  pink: 'linear-gradient(135deg,#a8484f,#d98a7f)',
  dark: 'linear-gradient(135deg,#3a2414,#6b4528)',
  green: 'linear-gradient(135deg,#2f5d50,#5f8f7c)',
};
