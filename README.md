# Dubai Kafe — бот доставки (@Dubaikafebot)

Telegram-бот + мини-апп + админ-панель для доставки. Монорепозиторий:

| Папка | Что делает | Технологии |
|---|---|---|
| `backend` | Telegram-бот (приём заказов, курьеры) + REST API + база | Node.js, Express, Prisma, PostgreSQL, node-telegram-bot-api |
| `mini-app` | Telegram Web App для клиентов: меню, корзина, оформление | React 18, Vite |
| `admin-panel` | Заказы, товары, акции, промокоды, курьеры, настройки | React 18, Vite |

**Как работает:** клиент открывает мини-апп → выбирает блюда → оформляет заказ → заказ сохраняется в базе и приходит в Telegram-группу курьеров. Курьер жмёт «✅ Men olaman», потом «🏁 Yetkazildi» (нажать может только тот, кто взял). Клиент получает уведомление о доставке. Владелец видит всё в админке.

## Меню

Меню лежит в `backend/src/models/menu.data.js` (сейчас там пример). Замените на настоящее и нажмите **«Обновить меню»** в админке (или `npm run seed` в `backend`). Товары можно также добавлять/редактировать вручную в админке.

## Локальный запуск

```bash
# Backend (порт 5000)
cd backend
cp .env.example .env      # заполните переменные
npm install
npm run dev

# Мини-апп (порт 5173), в другом терминале
cd mini-app && npm install && npm run dev

# Админка (порт 5174), в третьем терминале
cd admin-panel && npm install && npm run dev
```

Таблицы в базе создаются **автоматически** при старте backend (`ensure*` в `backend/src/database/connection.js`), миграции не нужны.
Для проверки мини-аппа в обычном браузере (без Telegram) задайте в `backend/.env` `DEV_TELEGRAM_ID=<ваш id>` — работает только при `NODE_ENV≠production`.

## Переменные окружения

**backend (Render):**

| Переменная | Что это |
|---|---|
| `DATABASE_URL` | Строка подключения Neon PostgreSQL (Pooled) |
| `BOT_TOKEN` | Токен бота от @BotFather |
| `ADMIN_PASSWORD` | Пароль входа в админку |
| `MINI_APP_URL` | Адрес мини-аппа на Vercel (кнопка в боте) |
| `COURIER_GROUP_ID` | ID группы курьеров (узнать: добавьте бота в группу и отправьте `/id`) |
| `NODE_ENV` | `production` |
| `RENDER_EXTERNAL_URL` | Ставится Render автоматически (keep-alive) |

**mini-app и admin-panel (Vercel):** `VITE_API_URL` — адрес backend, например `https://dubaikafe-backend.onrender.com`.

## Деплой

1. **Telegram:** @BotFather → `/newbot` (username `Dubaikafebot`) → получите `BOT_TOKEN`. Создайте группу курьеров, добавьте туда бота, отправьте `/id` — это `COURIER_GROUP_ID`.
2. **Neon:** neon.tech → новый проект (регион Frankfurt) → скопируйте Connection string → `DATABASE_URL`.
3. **Render (backend):** render.com → New → Blueprint → выберите этот репозиторий (`render.yaml` подхватится) → впишите переменные → Deploy. Скопируйте адрес `…onrender.com`.
4. **Vercel (2 проекта из одного репозитория):**
   - Мини-апп: Root Directory `mini-app`, Framework Vite, Build `npm run build`, Output `dist`, env `VITE_API_URL`.
   - Админка: Root Directory `admin-panel`, то же самое.
5. Адрес мини-аппа впишите в `MINI_APP_URL` на Render и в BotFather → `/setmenubutton`.
6. Откройте админку → «Товары» → «Обновить меню».

## Бизнес-правила

| Правило | По умолчанию |
|---|---|
| Бесплатная доставка от | 100 000 сум (настраивается в админке) |
| Платная доставка (позиция «Yetkazib berish») | 8 000 сум, если сумма меньше порога |
| Апселл Coca-Cola | 5 000 сум, показывается только при заказе ≥ порога |
| Телефон | +998 фиксировано + ровно 9 цифр |
| Просроченный заказ | > 10 минут без доставки — красный пульс в админке |
| Промокод | процент или фикс; сумма и скидка пересчитываются на сервере |
| Курьер | «Yetkazildi» может нажать только тот, кто взял заказ |
| Keep-alive | самопинг `/health` каждые ~10 мин |
| Статусы | `kutilmoqda` → `yetkazildi` |

## API

Клиентские: `GET /api/products`, `GET /api/banners`, `GET /api/settings`, `POST /api/promo/check`, `POST /api/orders`*, `GET /api/orders/my`* (* — заголовок `X-Telegram-Init-Data`, подпись проверяется).

Админские (заголовок `X-Admin-Password`): `/api/admin/orders`, `/products`, `/banners`, `/promos`, `/couriers`, `/settings`, `POST /api/admin/seed`.
