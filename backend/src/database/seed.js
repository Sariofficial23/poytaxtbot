import { prisma, ensureDatabase } from './connection.js';
import { MENU } from '../models/menu.data.js';

await ensureDatabase();
await prisma.$transaction([prisma.product.deleteMany({}), prisma.product.createMany({ data: MENU })]);
console.log(`✅ Menu seeded: ${MENU.length} products`);
await prisma.$disconnect();
