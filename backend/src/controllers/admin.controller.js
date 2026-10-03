import { prisma } from '../database/connection.js';
import { getSettings, saveSettings } from '../models/settings.model.js';
import { normalizeCode } from '../models/promo.model.js';
import { MENU } from '../models/menu.data.js';
import { notifyClient, testCourierGroup } from '../core/bot.js';

const ORDER_STATUSES = ['kutilmoqda', 'yetkazildi'];
const intOrNull = (v) => (v === '' || v === null || v === undefined ? null : Math.round(Number(v)) || 0);
const strOrNull = (v) => (v === '' || v === undefined || v === null ? null : String(v));

function dateRange(query) {
  const where = {};
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lt = new Date(query.to);
  }
  return where;
}

// ---------- Orders ----------
export async function listOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: dateRange(req.query),
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  res.json(orders);
}

export async function updateOrder(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
  const order = await prisma.order.update({ where: { id }, data: { status }, include: { user: true } });
  if (status === 'yetkazildi') notifyClient(order.user.telegramId, `✅ Buyurtmangiz #${id} yetkazildi. Yoqimli ishtaha! 😋`);
  res.json(order);
}

// ---------- Products ----------
const productData = (b) => ({
  name: String(b.name || '').trim(),
  description: String(b.description || ''),
  category: String(b.category || '').trim(),
  image: strOrNull(b.image),
  oldPrice: intOrNull(b.oldPrice),
  newPrice: Math.max(0, Math.round(Number(b.newPrice) || 0)),
  available: b.available !== false,
});

export const listProducts = async (_req, res) =>
  res.json(await prisma.product.findMany({ orderBy: { id: 'asc' } }));

export async function createProduct(req, res) {
  const data = productData(req.body);
  if (!data.name || !data.category) return res.status(400).json({ error: 'name va category kerak' });
  res.status(201).json(await prisma.product.create({ data }));
}

export async function updateProduct(req, res) {
  res.json(await prisma.product.update({ where: { id: Number(req.params.id) }, data: productData(req.body) }));
}

export async function deleteProduct(req, res) {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

// Перезалить полное меню из кода (кнопка «Обновить меню»)
export async function seedMenu(_req, res) {
  await prisma.$transaction([
    prisma.product.deleteMany({}),
    prisma.product.createMany({ data: MENU }),
  ]);
  res.json({ ok: true, count: MENU.length });
}

// ---------- Banners ----------
const bannerData = (b) => ({
  title: String(b.title || '').trim(),
  subtitle: strOrNull(b.subtitle),
  image: strOrNull(b.image),
  emoji: strOrNull(b.emoji),
  price: strOrNull(b.price),
  color: strOrNull(b.color),
  linkType: strOrNull(b.linkType),
  linkValue: strOrNull(b.linkValue),
  active: b.active === undefined ? true : Boolean(b.active),
  sort: Math.round(Number(b.sort) || 0),
});

export const listBanners = async (_req, res) =>
  res.json(await prisma.banner.findMany({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] }));

export async function createBanner(req, res) {
  const data = bannerData(req.body);
  if (!data.title) return res.status(400).json({ error: 'title kerak' });
  res.status(201).json(await prisma.banner.create({ data }));
}

export async function updateBanner(req, res) {
  res.json(await prisma.banner.update({ where: { id: Number(req.params.id) }, data: bannerData(req.body) }));
}

export async function deleteBanner(req, res) {
  await prisma.banner.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

// ---------- Promos ----------
const promoData = (b) => ({
  code: normalizeCode(b.code),
  type: b.type === 'fixed' ? 'fixed' : 'percent',
  value: Math.max(0, Math.round(Number(b.value) || 0)),
  active: b.active === undefined ? true : Boolean(b.active),
});

export async function listPromos(_req, res) {
  const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
  const stats = await prisma.order.groupBy({
    by: ['promoCode'],
    where: { promoCode: { not: null } },
    _count: { _all: true },
    _sum: { total: true, discount: true },
  });
  const byCode = Object.fromEntries(stats.map((s) => [s.promoCode, s]));
  res.json(
    promos.map((p) => ({
      ...p,
      stats: {
        orders: byCode[p.code]?._count._all || 0,
        sales: byCode[p.code]?._sum.total || 0,
        discount: byCode[p.code]?._sum.discount || 0,
      },
    }))
  );
}

export async function createPromo(req, res) {
  const data = promoData(req.body);
  if (!data.code || !data.value) return res.status(400).json({ error: 'code va value kerak' });
  if (data.type === 'percent' && data.value > 100) return res.status(400).json({ error: 'Foiz 100 dan oshmasin' });
  try {
    res.status(201).json(await prisma.promo.create({ data }));
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Bunday kod mavjud' });
    throw e;
  }
}

export async function updatePromo(req, res) {
  const data = promoData(req.body);
  if (data.type === 'percent' && data.value > 100) return res.status(400).json({ error: 'Foiz 100 dan oshmasin' });
  res.json(await prisma.promo.update({ where: { id: Number(req.params.id) }, data }));
}

export async function deletePromo(req, res) {
  await prisma.promo.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

// ---------- Couriers report ----------
export async function couriersReport(req, res) {
  const rows = await prisma.order.groupBy({
    by: ['courier', 'status'],
    where: { ...dateRange(req.query), courier: { not: null } },
    _count: { _all: true },
    _sum: { total: true },
  });
  const map = {};
  for (const r of rows) {
    const c = (map[r.courier] ||= { courier: r.courier, taken: 0, delivered: 0, sum: 0 });
    c.taken += r._count._all;
    if (r.status === 'yetkazildi') {
      c.delivered += r._count._all;
      c.sum += r._sum.total || 0;
    }
  }
  res.json(Object.values(map).sort((a, b) => b.delivered - a.delivered));
}

// ---------- Settings ----------
export const readSettings = async (_req, res) => res.json(await getSettings());
export const writeSettings = async (req, res) => res.json(await saveSettings(req.body || {}));

export const ping = (_req, res) => res.json({ ok: true });

export const testCourier = async (_req, res) => res.json(await testCourierGroup());
