import { prisma } from '../database/connection.js';

export function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

export function calcDiscount(promo, amount) {
  if (!promo) return 0;
  const raw = promo.type === 'fixed' ? promo.value : Math.floor((amount * promo.value) / 100);
  return Math.max(0, Math.min(raw, amount)); // скидка не больше суммы товаров
}

export async function findActivePromo(code) {
  const c = normalizeCode(code);
  if (!c) return null;
  const promo = await prisma.promo.findUnique({ where: { code: c } });
  return promo && promo.active ? promo : null;
}
