from html import escape

from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from ..config import Config
from ..db import Database
from ..keyboards import (
    CartCb,
    CatCb,
    ItemCb,
    LangCb,
    NavCb,
    cart_kb,
    categories_kb,
    item_kb,
    items_kb,
    lang_kb,
    main_kb,
)
from ..menu import Menu, localize
from ..services import cart_text
from ..texts import all_variants, money, t

router = Router(name="user")


def hours_str(config: Config) -> str:
    start, end = config.work_hours
    return f"{start:%H:%M}–{end:%H:%M}"


# --- start & language ---
@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext, lang: str, lang_chosen: bool, config: Config):
    await state.clear()
    if not lang_chosen:
        await message.answer(t("choose_lang", lang), reply_markup=lang_kb())
        return
    await message.answer(t("welcome", lang, cafe=escape(config.cafe_name)), reply_markup=main_kb(lang))


@router.message(F.text.in_(all_variants("btn_lang")))
async def change_lang(message: Message):
    await message.answer(t("choose_lang", "ru"), reply_markup=lang_kb())


@router.callback_query(LangCb.filter())
async def set_lang(call: CallbackQuery, callback_data: LangCb, db: Database, config: Config):
    lang = callback_data.code
    await db.set_lang(call.from_user.id, lang)
    await call.message.delete()
    await call.message.answer(t("welcome", lang, cafe=escape(config.cafe_name)), reply_markup=main_kb(lang))
    await call.answer()


# --- menu navigation ---
@router.message(F.text.in_(all_variants("btn_menu")))
async def show_categories(message: Message, lang: str, menu: Menu):
    if not menu.visible_categories():
        await message.answer(t("menu_empty", lang))
        return
    await message.answer(t("categories", lang), reply_markup=categories_kb(menu, lang))


async def _replace_with_text(call: CallbackQuery, text: str, markup) -> None:
    """Edit the message in place, or resend it if it was a photo card."""
    if call.message.photo:
        await call.message.delete()
        await call.message.answer(text, reply_markup=markup)
    else:
        try:
            await call.message.edit_text(text, reply_markup=markup)
        except TelegramBadRequest:
            pass


@router.callback_query(NavCb.filter(F.to == "categories"))
async def back_to_categories(call: CallbackQuery, lang: str, menu: Menu):
    await _replace_with_text(call, t("categories", lang), categories_kb(menu, lang))
    await call.answer()


@router.callback_query(CatCb.filter())
@router.callback_query(NavCb.filter(F.to == "category"))
async def show_items(call: CallbackQuery, callback_data: CatCb | NavCb, lang: str, menu: Menu, config: Config):
    category = menu.category(callback_data.id)
    if not category:
        await call.answer(t("menu_empty", lang), show_alert=True)
        return
    text = t("items", lang, category=escape(localize(category.name, lang)))
    await _replace_with_text(call, text, items_kb(menu, category.id, lang, config.currency))
    await call.answer()


@router.callback_query(ItemCb.filter(F.action == "open"))
async def show_item(call: CallbackQuery, callback_data: ItemCb, lang: str, menu: Menu, config: Config):
    item = menu.items.get(callback_data.id)
    if not item or not item.available:
        await call.answer(t("unavailable", lang), show_alert=True)
        return
    caption = t(
        "item_card",
        lang,
        name=escape(localize(item.name, lang)),
        description=escape(localize(item.description, lang)),
        price=money(item.price, config.currency),
    )
    markup = item_kb(item.id, item.category_id, 1, lang)
    await call.message.delete()
    if item.photo:
        try:
            await call.message.answer_photo(item.photo, caption=caption, reply_markup=markup)
            await call.answer()
            return
        except TelegramBadRequest:
            pass  # bad photo link — fall back to text
    await call.message.answer(caption, reply_markup=markup)
    await call.answer()


@router.callback_query(ItemCb.filter(F.action == "qty"))
async def change_item_qty(call: CallbackQuery, callback_data: ItemCb, lang: str, menu: Menu):
    item = menu.items.get(callback_data.id)
    if item:
        try:
            await call.message.edit_reply_markup(
                reply_markup=item_kb(item.id, item.category_id, callback_data.qty, lang)
            )
        except TelegramBadRequest:
            pass  # same qty pressed — nothing to change
    await call.answer()


@router.callback_query(ItemCb.filter(F.action == "add"))
async def add_item(call: CallbackQuery, callback_data: ItemCb, lang: str, menu: Menu, db: Database, config: Config):
    item = menu.items.get(callback_data.id)
    if not item or not item.available:
        await call.answer(t("unavailable", lang), show_alert=True)
        return
    await db.add_to_cart(call.from_user.id, item.id, callback_data.qty)
    await call.answer(t("added", lang, name=localize(item.name, lang), qty=callback_data.qty))
    category = menu.category(item.category_id)
    text = t("items", lang, category=escape(localize(category.name, lang)))
    await _replace_with_text(call, text, items_kb(menu, category.id, lang, config.currency))


# --- cart ---
async def _cart_view(user_id: int, lang: str, menu: Menu, db: Database, config: Config):
    cart = {i: q for i, q in (await db.get_cart(user_id)).items() if i in menu.items}
    if not cart:
        return t("cart_empty", lang), None
    return cart_text(menu, cart, lang, config), cart_kb(menu, cart, lang)


@router.message(F.text.in_(all_variants("btn_cart")))
async def show_cart(message: Message, lang: str, menu: Menu, db: Database, config: Config):
    text, markup = await _cart_view(message.from_user.id, lang, menu, db, config)
    await message.answer(text, reply_markup=markup)


@router.callback_query(CartCb.filter(F.action.in_({"inc", "dec", "clear", "noop"})))
async def edit_cart(call: CallbackQuery, callback_data: CartCb, lang: str, menu: Menu, db: Database, config: Config):
    uid = call.from_user.id
    notice = None
    if callback_data.action == "inc":
        await db.change_qty(uid, callback_data.id, 1)
    elif callback_data.action == "dec":
        await db.change_qty(uid, callback_data.id, -1)
    elif callback_data.action == "clear":
        await db.clear_cart(uid)
        notice = t("cart_cleared", lang)
    else:
        await call.answer()
        return
    text, markup = await _cart_view(uid, lang, menu, db, config)
    try:
        await call.message.edit_text(text, reply_markup=markup)
    except TelegramBadRequest:
        pass
    await call.answer(notice)


# --- orders & contacts ---
@router.message(F.text.in_(all_variants("btn_orders")))
async def my_orders(message: Message, lang: str, db: Database, config: Config):
    orders = await db.user_orders(message.from_user.id)
    if not orders:
        await message.answer(t("no_orders", lang))
        return
    lines = [t("my_orders", lang), ""]
    for o in orders:
        lines.append(
            f"№{o['id']} · {o['created_at'][:16]} · {money(o['total'], config.currency)} · {t('status_' + o['status'], lang)}"
        )
    await message.answer("\n".join(lines))


@router.message(F.text.in_(all_variants("btn_contacts")))
async def contacts(message: Message, lang: str, config: Config):
    await message.answer(
        t(
            "contacts",
            lang,
            cafe=escape(config.cafe_name),
            phone=escape(config.cafe_phone),
            address=escape(config.cafe_address),
            hours=hours_str(config),
        )
    )
