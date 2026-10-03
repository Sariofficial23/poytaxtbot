export const money = (n) => `${Number(n || 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;

export const escapeHtml = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function orderText(order, user, extra = '') {
  const items = (order.items || [])
    .map((i) => `• ${escapeHtml(i.name)} × ${i.qty} = ${money(i.price * i.qty)}`)
    .join('\n');
  const lines = [
    `🧾 <b>Buyurtma #${order.id}</b>`,
    '',
    items,
    '',
    order.discount ? `🎟 Promokod ${escapeHtml(order.promoCode)}: −${money(order.discount)}` : null,
    `💰 <b>Jami: ${money(order.total)}</b>`,
    `👤 ${escapeHtml(user?.name || '')}`,
    order.phone ? `📞 ${escapeHtml(order.phone)}` : null,
    order.location ? `📍 ${escapeHtml(order.location)}` : null,
    extra || null,
  ];
  return lines.filter((l) => l !== null).join('\n');
}
