import asyncio
import json
import logging

from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import CallbackQuery, Message

from ..config import Config
from ..db import Database
from ..keyboards import StatusCb, admin_order_kb
from ..menu import Menu
from ..services import admin_order_text
from ..texts import money, t

router = Router(name="admin")
log = logging.getLogger(__name__)


def is_admin(user_id: int, config: Config) -> bool:
    return user_id in config.admin_ids


@router.message(Command("id"))
async def cmd_id(message: Message):
    """Helps to find your own ID and the group ID for .env."""
    await message.answer(f"Ваш ID: <code>{message.from_user.id}</code>\nID этого чата: <code>{message.chat.id}</code>")


@router.message(Command("admin"))
async def cmd_admin(message: Message, config: Config):
    if not is_admin(message.from_user.id, config):
        return
    await message.answer(
        "<b>Команды администратора</b>\n"
        "/stats — статистика\n"
        "/reload — перечитать menu.json без перезапуска\n"
        "/broadcast текст — рассылка всем пользователям\n"
        "/id — показать ID чата"
    )


@router.message(Command("stats"))
async def cmd_stats(message: Message, db: Database, config: Config):
    if not is_admin(message.from_user.id, config):
        return
    s = await db.stats(config.now().strftime("%Y-%m-%d"))
    await message.answer(
        "📊 <b>Статистика</b>\n"
        f"Пользователей: {s['users']}\n"
        f"Заказов всего: {s['orders_total']}\n"
        f"Заказов сегодня: {s['orders_today']}\n"
        f"Выручка сегодня (выполненные): {money(s['revenue_today'], config.currency)}\n"
        f"Выручка всего (выполненные): {money(s['revenue_total'], config.currency)}"
    )


@router.message(Command("reload"))
async def cmd_reload(message: Message, menu: Menu, config: Config):
    if not is_admin(message.from_user.id, config):
        return
    try:
        menu.load()
    except Exception as e:
        await message.answer(f"❌ Ошибка в menu.json: <code>{e}</code>")
        return
    await message.answer(f"✅ Меню обновлено: {len(menu.categories)} категорий, {len(menu.items)} блюд.")


@router.message(Command("broadcast"))
async def cmd_broadcast(message: Message, command: CommandObject, bot: Bot, db: Database, config: Config):
    if not is_admin(message.from_user.id, config):
        return
    if not command.args:
        await message.answer("Использование: /broadcast Текст сообщения")
        return
    sent = failed = 0
    for uid in await db.all_user_ids():
        try:
            await bot.send_message(uid, command.args)
            sent += 1
        except Exception:
            failed += 1
        await asyncio.sleep(0.05)  # stay under Telegram limits
    await message.answer(f"Рассылка завершена. Доставлено: {sent}, ошибок: {failed}.")


@router.callback_query(StatusCb.filter())
async def change_status(call: CallbackQuery, callback_data: StatusCb, bot: Bot, db: Database, config: Config):
    in_orders_chat = config.orders_chat_id and call.message.chat.id == config.orders_chat_id
    if not (is_admin(call.from_user.id, config) or in_orders_chat):
        await call.answer("Нет доступа", show_alert=True)
        return
    order = await db.get_order(callback_data.order_id)
    if not order:
        await call.answer("Заказ не найден", show_alert=True)
        return
    if order["status"] == callback_data.status:
        await call.answer("Статус уже установлен")
        return

    await db.set_order_status(order["id"], callback_data.status)
    order = await db.get_order(order["id"])
    customer = await db.get_user(order["user_id"])

    text = admin_order_text(
        order, customer["full_name"] or "", customer["username"], json.loads(order["items"]), config
    )
    text += f"\n\n✏️ {call.from_user.full_name}: {t('status_' + order['status'], 'ru')}"
    finished = order["status"] in ("delivered", "cancelled")
    await call.message.edit_text(
        text,
        reply_markup=None if finished else admin_order_kb(order["id"], order["delivery_type"]),
        disable_web_page_preview=True,
    )

    lang = customer["lang"] or "ru"
    try:
        await bot.send_message(
            order["user_id"],
            t("status_changed", lang, id=order["id"], status=t("status_" + order["status"], lang)),
        )
    except Exception:
        log.warning("Could not notify user %s about order %s", order["user_id"], order["id"])
    await call.answer("Готово")
