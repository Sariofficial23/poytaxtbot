import { prisma } from '../database/connection.js';
import { DEFAULT_SETTINGS } from '../config/default.js';

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const result = { ...DEFAULT_SETTINGS };
  for (const { key, value } of rows) {
    if (key in DEFAULT_SETTINGS) {
      const num = Number(value);
      if (Number.isFinite(num)) result[key] = num;
    }
  }
  return result;
}

export async function saveSettings(data) {
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (data[key] === undefined) continue;
    const value = String(Math.max(0, Math.round(Number(data[key]) || 0)));
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return getSettings();
}
