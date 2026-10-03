import 'dotenv/config';

const config = {
  port: Number(process.env.PORT) || 5000,
  botToken: process.env.BOT_TOKEN || '',
  databaseUrl: process.env.DATABASE_URL || '',
  miniAppUrl: process.env.MINI_APP_URL || '',
  courierGroupId: process.env.COURIER_GROUP_ID || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL || '',
  devTelegramId: process.env.DEV_TELEGRAM_ID || '',
  isProduction: process.env.NODE_ENV === 'production',
  botName: 'Dubai Kafe',
};

export const DEFAULT_SETTINGS = {
  freeFrom: 100000, // порог бесплатной доставки
  deliveryFee: 8000, // цена доставки
  colaPrice: 5000, // апселл Coca-Cola
};

export default config;
