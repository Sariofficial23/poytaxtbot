import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// На продакшене prisma migrate не запускаем — база достраивается сама
// через CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

export async function ensureUserTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL PRIMARY KEY,
      "telegramId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_telegramId_key" ON "User"("telegramId")`
  );
}

export async function ensureProductTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" SERIAL PRIMARY KEY,
      "image" TEXT,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "oldPrice" INTEGER,
      "newPrice" INTEGER NOT NULL,
      "category" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
}

export async function ensureSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL
    )`);
}

export async function ensurePromoTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Promo" (
      "id" SERIAL PRIMARY KEY,
      "code" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'percent',
      "value" INTEGER NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "usedCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Promo_code_key" ON "Promo"("code")`
  );
}

export async function ensureBannerTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Banner" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "subtitle" TEXT,
      "image" TEXT,
      "emoji" TEXT,
      "price" TEXT,
      "color" TEXT,
      "linkType" TEXT,
      "linkValue" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "sort" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
}

export async function ensureOrderTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "items" JSONB NOT NULL,
      "total" INTEGER NOT NULL,
      "location" TEXT,
      "phone" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  // Новые колонки — добавляются к уже существующей таблице без миграций
  const columns = [
    `"promoCode" TEXT`,
    `"discount" INTEGER NOT NULL DEFAULT 0`,
    `"status" TEXT NOT NULL DEFAULT 'kutilmoqda'`,
    `"courier" TEXT`,
    `"courierId" TEXT`,
  ];
  for (const col of columns) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS ${col}`);
  }
}

export async function ensureDatabase() {
  await ensureUserTable();
  await ensureProductTable();
  await ensureSettingsTable();
  await ensurePromoTable();
  await ensureBannerTable();
  await ensureOrderTable();
}
