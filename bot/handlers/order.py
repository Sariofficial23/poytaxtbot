import json
import logging
import re

from aiogram import Bot, F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message, ReplyKeyboardRemove

from ..config import Config
from ..db import Database
from ..keyboards import (
    CartCb,
    CheckoutCb,
    admin_order_kb,
    confirm_kb,
    delivery_type_kb,
    location_kb,
    main_kb,
    payment_kb,
    phone_kb,
    skip_kb,
)
from ..menu import Menu
from ..services import admin_order_text, order_items_snapshot, order_summary
from ..texts import all_variants, money, t
from .user import hours_str

router = Router(name="order")
log = logging.getLogger(__name__)

PHONE_RE = re.compile(r"^\+?\d{9,15}$")


class Checkout(StatesGroup):
    delivery_type = State()
    location = State()
    address_details = State()
    phone = State()
    comment = State()
    payment = State()
    confirm = State()


async def _valid_cart(user_id: int, menu: Menu, db: Database) -> dict[str, int]:
    cart = await db.get_cart(user_id)
    return {i: q for i, q in cart.items() if i in menu.items and menu.items[i].available}


async def _check_can_order(user_id: int, lang: str, menu: Menu, db: Database, config: Config) -> str | None:
    """Returns an error text if the order can't be placed right now."""
    if not config.is_open():
        return t("closed", lang, hours=hours_str(config))
    cart = await _valid_cart(user_id, menu, db)
    if not cart:
        return t("cart_empty", lang)
    subtotal = sum(menu.items[i].price * q for i, q in cart.items())
    if subtotal < config.min_order:
        return t("min_order", lang, amount=money(config.min_order, config.currency))
    return None


# --- start ---
@router.callback_query(CartCb.filter(F.action == "checkout"))
async def start_checkout(call: CallbackQuery, state: FSMContext, lang: str, menu: Menu, db: Database, config: Config):
    error = await _check_can_order(call.from_user.id, lang, menu, db, config)
    if error:
        await call.answer(error, show_alert=True)
        return
    await state.clear()
    await state.set_state(Checkout.delivery_type)
    await call.message.answer(t("ask_delivery_type", lang), reply_markup=delivery_type_kb(lang))
    await call.answer()


# --- cancel (works on every step) ---
@router.callback_query(CheckoutCb.filter(F.step == "cancel"))
async def cancel_inline(call: CallbackQuery, state: FSMContext, lang: str):
    await state.clear()
    await call.message.edit_reply_markup(reply_markup=None)
    await call.message.answer(t("order_cancelled_by_user", lang), reply_markup=main_kb(lang))
    await call.answer()


@router.message(StateFilter(Checkout), F.text.in_(all_variants("btn_cancel")))
async def cancel_text(message: Message, state: FSMContext, lang: str):
    await state.clear()
    await message.answer(t("order_cancelled_by_user", lang), reply_markup=main_kb(lang))


# --- delivery type ---
@router.callback_query(Checkout.delivery_type, CheckoutCb.filter(F.step == "type"))
async def got_delivery_type(call: CallbackQuery, callback_data: CheckoutCb, state: FSMContext, lang: str, db: Database):
    await state.update_data(delivery_type=callback_data.value, address=None, latitude=None, longitude=None)
    await call.message.edit_reply_markup(reply_markup=None)
    if callback_data.value == "delivery":
        await state.set_state(Checkout.location)
        await call.message.answer(t("ask_location", lang), reply_markup=location_kb(lang))
    else:
        await _ask_phone(call.message, state, lang, db, call.from_user.id)
    await call.answer()


# --- address ---
@router.message(Checkout.location, F.location)
async def got_location(message: Message, state: FSMContext, lang: str):
    await state.update_data(latitude=message.location.latitude, longitude=message.location.longitude)
    await state.set_state(Checkout.address_details)
    await message.answer(t("ask_address_details", lang), reply_markup=skip_kb(lang))


@router.message(Checkout.location, F.text)
async def got_address_text(message: Message, state: FSMContext, lang: str, db: Database):
    await state.update_data(address=message.text[:500])
    await _ask_phone(message, state, lang, db, message.from_user.id)


@router.message(Checkout.address_details, F.text)
async def got_address_details(message: Message, state: FSMContext, lang: str, db: Database):
    if message.text not in all_variants("btn_skip"):
        await state.update_data(address=message.text[:500])
    await _ask_phone(message, state, lang, db, message.from_user.id)


# --- phone ---
async def _ask_phone(message: Message, state: FSMContext, lang: str, db: Database, user_id: int):
    user = await db.get_user(user_id)
    await state.set_state(Checkout.phone)
    await message.answer(t("ask_phone", lang), reply_markup=phone_kb(lang, user["phone"] if user else None))


async def _save_phone_and_continue(message: Message, phone: str, state: FSMContext, lang: str, db: Database):
    await db.set_phone(message.from_user.id, phone)
    await state.update_data(phone=phone)
    await state.set_state(Checkout.comment)
    await message.answer(t("ask_comment", lang), reply_markup=skip_kb(lang))


@router.message(Checkout.phone, F.contact)
async def got_contact(message: Message, state: FSMContext, lang: str, db: Database):
    phone = message.contact.phone_number
    if not phone.startswith("+"):
        phone = "+" + phone
    await _save_phone_and_continue(message, phone, state, lang, db)


@router.message(Checkout.phone, F.text)
async def got_phone_text(message: Message, state: FSMContext, lang: str, db: Database):
    phone = re.sub(r"[\s\-()]", "", message.text)
    if not PHONE_RE.match(phone):
        await message.answer(t("bad_phone", lang))
        return
    await _save_phone_and_continue(message, phone, state, lang, db)


# --- comment ---
@router.message(Checkout.comment, F.text)
async def got_comment(message: Message, state: FSMContext, lang: str):
    comment = None if message.text in all_variants("btn_skip") else message.text[:500]
    await state.update_data(comment=comment)
    await state.set_state(Checkout.payment)
    await message.answer("👌", reply_markup=ReplyKeyboardRemove())
    await message.answer(t("ask_payment", lang), reply_markup=payment_kb(lang))


# --- payment ---
@router.callback_query(Checkout.payment, CheckoutCb.filter(F.step == "pay"))
async def got_payment(call: CallbackQuery, callback_data: CheckoutCb, state: FSMContext, lang: str, menu: Menu, db: Database, config: Config):
    await state.update_data(payment=callback_data.value)
    data = await state.get_data()
    cart = await _valid_cart(call.from_user.id, menu, db)
    await state.set_state(Checkout.confirm)
    await call.message.edit_text(order_summary(data, menu, cart, lang, config), reply_markup=confirm_kb(lang))
    await call.answer()


# --- confirm ---
@router.callback_query(Checkout.confirm, CheckoutCb.filter(F.step == "confirm"))
async def confirm_order(call: CallbackQuery, state: FSMContext, bot: Bot, lang: str, menu: Menu, db: Database, config: Config):
    uid = call.from_user.id
    error = await _check_can_order(uid, lang, menu, db, config)
    if error:
        await call.answer(error, show_alert=True)
        return

    data = await state.get_data()
    cart = await _valid_cart(uid, menu, db)
    items = order_items_snapshot(menu, cart)
    subtotal = sum(i["price"] * i["qty"] for i in items)
    fee = config.delivery_fee if data["delivery_type"] == "delivery" else 0
    order_id = await db.create_order(
        user_id=uid,
        items=items,
        subtotal=subtotal,
        delivery_fee=fee,
        total=subtotal + fee,
        delivery_type=data["delivery_type"],
        address=data.get("address"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        phone=data["phone"],
        comment=data.get("comment"),
        payment=data["payment"],
        created_at=config.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    await db.clear_cart(uid)
    await state.clear()

    await call.message.edit_reply_markup(reply_markup=None)
    await call.message.answer(t("order_placed", lang, id=order_id), reply_markup=main_kb(lang))
    await call.answer()

    await notify_staff(bot, db, config, order_id, call.from_user.full_name, call.from_user.username)


async def notify_staff(bot: Bot, db: Database, config: Config, order_id: int, name: str, username: str | None):
    order = await db.get_order(order_id)
    text = admin_order_text(order, name, username, json.loads(order["items"]), config)
    markup = admin_order_kb(order_id, order["delivery_type"])
    targets = [config.orders_chat_id] if config.orders_chat_id else config.admin_ids
    if not targets:
        log.warning("Order %s: no ORDERS_CHAT_ID or ADMIN_IDS configured, nobody was notified", order_id)
    for chat_id in targets:
        try:
            await bot.send_message(chat_id, text, reply_markup=markup, disable_web_page_preview=True)
            if order["latitude"] is not None:
                await bot.send_location(chat_id, order["latitude"], order["longitude"])
        except Exception:
            log.exception("Failed to send order %s to chat %s", order_id, chat_id)
