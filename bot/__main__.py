import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand

from .config import load_config
from .db import Database
from .handlers import admin, fallback, order, user
from .menu import Menu
from .middlewares import UserMiddleware


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    config = load_config()

    db = Database(config.db_path)
    await db.connect()
    menu = Menu(config.menu_path)
    logging.info("Menu loaded: %d categories, %d items", len(menu.categories), len(menu.items))

    bot = Bot(config.bot_token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(config=config, db=db, menu=menu)

    middleware = UserMiddleware(db)
    dp.message.outer_middleware(middleware)
    dp.callback_query.outer_middleware(middleware)

    # Order matters: checkout steps must catch text before the generic handlers.
    dp.include_routers(admin.router, order.router, user.router, fallback.router)

    await bot.set_my_commands([BotCommand(command="start", description="Главное меню / Bosh menyu")])
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        await db.close()
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
