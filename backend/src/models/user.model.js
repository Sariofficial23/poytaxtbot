import { prisma } from '../database/connection.js';

export function displayName(tgUser) {
  return [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Mijoz';
}

export function upsertUser(tgUser, extra = {}) {
  const telegramId = String(tgUser.id);
  return prisma.user.upsert({
    where: { telegramId },
    update: { name: displayName(tgUser), ...extra },
    create: { telegramId, name: displayName(tgUser), ...extra },
  });
}
