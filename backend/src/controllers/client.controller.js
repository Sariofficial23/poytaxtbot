import { prisma } from '../database/connection.js';
import { getSettings } from '../models/settings.model.js';
import { findActivePromo, calcDiscount, normalizeCode } from '../models/promo.model.js';
import { upsertUser } from '../models/user.model.js';
import { notifyCouriers } from '../core/bot.js';
import { cached, publicImage, getImage } from '../core/cache.js';

const httpError = (status, message) => Object.assign(new Error(message), { status, expose: true });

const loadProducts = () =>
  cached('products', async () => {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    return products.map((p) => ({ ...p, image: publicImage('product', p.id, p.image) }));
  });

const loadBanners = () =>
  cached('banners', async () => {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return banners.map((b) => ({ ...b, image: publicImage('banner', b.id, b.image) }));
  });

export async function getProducts(_req, res) {
  res.json(await loadProducts());
}

export async function getBanners(_req, res) {
  res.json(await loadBanners());
}

export async function getPublicSettings(_req, res) {
  res.json(await cached('settings', getSettings));
}

export async function getImageFile(req, res) {
  const { kind, id } = req.params;
  if (kind === 'product') await loadProducts();
  else if (kind === 'banner') await loadBanners();
  const img = getImage(kind, id);
  if (!img) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type(img.type).send(img.buf);
}

export async function checkPromo(req, res) {
  const amount = Math.max(0, Number(req.body.amount) || 0);
  const promo = await findActivePromo(req.body.code);
  if (!promo) return res.json({ ok: false, error: 'Promokod topilmadi' });
  res.json({
    ok: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount: calcDiscount(promo, amount),
  });
}

export function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > 9) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  return digits.length === 9 ? `+998${digits}` : null;
}

export async function createOrder(req, res) {
  const { items = [], cola = false, phone, address = '', lat, lng, promoCode } = req.body || {};

  // Сумму считаем на сервере заново — клиенту не доверяем
  const qtyById = new Map();
  for (const it of Array.isArray(items) ? items : []) {
    const id = Number(it.id);
    const qty = Math.min(99, Math.max(0, Math.floor(Number(it.qty) || 0)));
    if (id && qty) qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }
  if (!qtyById.size) throw httpError(400, "Savat bo'sh");

  const products = await prisma.product.findMany({ where: { id: { in: [...qtyById.keys()] } } });
  if (!products.length) throw httpError(400, 'Mahsulotlar topilmadi');

  const orderItems = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.newPrice,
    qty: qtyById.get(p.id),
  }));
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  const phoneNorm = normalizePhone(phone);
  if (!phoneNorm) throw httpError(400, "Telefon raqam noto'g'ri");

  const settings = await cached('settings', getSettings);
  const promo = promoCode ? await findActivePromo(promoCode) : null;
  if (promoCode && !promo) throw httpError(400, 'Promokod topilmadi');
  const discount = calcDiscount(promo, subtotal);

  if (cola && subtotal >= settings.freeFrom) {
    orderItems.push({ id: 'cola', name: 'Coca-Cola', price: settings.colaPrice, qty: 1 });
  }
  if (subtotal < settings.freeFrom && settings.deliveryFee > 0) {
    orderItems.push({ id: 'delivery', name: 'Yetkazib berish', price: settings.deliveryFee, qty: 1 });
  }
  const total = orderItems.reduce((s, i) => s + i.price * i.qty, 0) - discount;

  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && lat !== null && lng !== null;
  const location =
    [String(address).trim().slice(0, 300), hasCoords ? `https://maps.google.com/?q=${Number(lat)},${Number(lng)}` : '']
      .filter(Boolean)
      .join(' — ') || null;
  if (!location) throw httpError(400, 'Manzilni kiriting');

  const user = await upsertUser(req.tgUser, { phone: phoneNorm });

  const order = await prisma.$transaction(async (tx) => {
    if (promo) await tx.promo.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
    return tx.order.create({
      data: {
        userId: user.id,
        items: orderItems,
        total,
        phone: phoneNorm,
        location,
        promoCode: promo ? normalizeCode(promo.code) : null,
        discount,
      },
    });
  });

  notifyCouriers(order, user);
  res.status(201).json(order);
}

export async function getMyOrders(req, res) {
  const user = await prisma.user.findUnique({ where: { telegramId: String(req.tgUser.id) } });
  if (!user) return res.json([]);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(orders);
}
