from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from .menu import Menu, localize
from .texts import money, t

ORDER_STATUSES = ["accepted", "cooking", "on_the_way", "ready", "delivered", "cancelled"]


class LangCb(CallbackData, prefix="lang"):
    code: str


class CatCb(CallbackData, prefix="cat"):
    id: str


class ItemCb(CallbackData, prefix="item"):
    action: str  # open | qty | add
    id: str
    qty: int = 1


class CartCb(CallbackData, prefix="cart"):
    action: str  # inc | dec | del | clear | checkout | noop
    id: str = ""


class NavCb(CallbackData, prefix="nav"):
    to: str  # categories | category
    id: str = ""


class CheckoutCb(CallbackData, prefix="co"):
    step: str  # type | pay | confirm | cancel
    value: str = ""


class StatusCb(CallbackData, prefix="st"):
    order_id: int
    status: str


def lang_kb() -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    b.button(text="🇷🇺 Русский", callback_data=LangCb(code="ru"))
    b.button(text="🇺🇿 O'zbekcha", callback_data=LangCb(code="uz"))
    return b.as_markup()


def main_kb(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=t("btn_menu", lang))],
            [KeyboardButton(text=t("btn_cart", lang)), KeyboardButton(text=t("btn_orders", lang))],
            [KeyboardButton(text=t("btn_contacts", lang)), KeyboardButton(text=t("btn_lang", lang))],
        ],
        resize_keyboard=True,
    )


def categories_kb(menu: Menu, lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    for c in menu.visible_categories():
        b.button(text=localize(c.name, lang), callback_data=CatCb(id=c.id))
    b.adjust(2)
    return b.as_markup()


def items_kb(menu: Menu, category_id: str, lang: str, currency: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    category = menu.category(category_id)
    for item in category.items if category else []:
        if item.available:
            b.button(
                text=f"{localize(item.name, lang)} — {money(item.price, currency)}",
                callback_data=ItemCb(action="open", id=item.id),
            )
    b.button(text=t("btn_back", lang), callback_data=NavCb(to="categories"))
    b.adjust(1)
    return b.as_markup()


def item_kb(item_id: str, category_id: str, qty: int, lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    b.button(text="➖", callback_data=ItemCb(action="qty", id=item_id, qty=max(1, qty - 1)))
    b.button(text=str(qty), callback_data=ItemCb(action="qty", id=item_id, qty=qty))
    b.button(text="➕", callback_data=ItemCb(action="qty", id=item_id, qty=min(50, qty + 1)))
    b.button(text=t("btn_add", lang), callback_data=ItemCb(action="add", id=item_id, qty=qty))
    b.button(text=t("btn_back", lang), callback_data=NavCb(to="category", id=category_id))
    b.adjust(3, 1, 1)
    return b.as_markup()


def cart_kb(menu: Menu, cart: dict[str, int], lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    for item_id, qty in cart.items():
        item = menu.items.get(item_id)
        if not item:
            continue
        b.button(text="➖", callback_data=CartCb(action="dec", id=item_id))
        b.button(text=f"{localize(item.name, lang)} × {qty}", callback_data=CartCb(action="noop"))
        b.button(text="➕", callback_data=CartCb(action="inc", id=item_id))
    b.button(text=t("btn_clear", lang), callback_data=CartCb(action="clear"))
    b.button(text=t("btn_checkout", lang), callback_data=CartCb(action="checkout"))
    sizes = [3] * len([i for i in cart if i in menu.items]) + [2]
    b.adjust(*sizes)
    return b.as_markup()


def delivery_type_kb(lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    b.button(text=t("btn_delivery", lang), callback_data=CheckoutCb(step="type", value="delivery"))
    b.button(text=t("btn_pickup", lang), callback_data=CheckoutCb(step="type", value="pickup"))
    b.button(text=t("btn_cancel", lang), callback_data=CheckoutCb(step="cancel"))
    b.adjust(2, 1)
    return b.as_markup()


def location_kb(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=t("btn_send_location", lang), request_location=True)],
            [KeyboardButton(text=t("btn_cancel", lang))],
        ],
        resize_keyboard=True,
    )


def phone_kb(lang: str, saved_phone: str | None) -> ReplyKeyboardMarkup:
    rows = [[KeyboardButton(text=t("btn_send_phone", lang), request_contact=True)]]
    if saved_phone:
        rows.append([KeyboardButton(text=saved_phone)])
    rows.append([KeyboardButton(text=t("btn_cancel", lang))])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


def skip_kb(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=t("btn_skip", lang))], [KeyboardButton(text=t("btn_cancel", lang))]],
        resize_keyboard=True,
    )


def payment_kb(lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    b.button(text=t("btn_cash", lang), callback_data=CheckoutCb(step="pay", value="cash"))
    b.button(text=t("btn_card", lang), callback_data=CheckoutCb(step="pay", value="card"))
    b.button(text=t("btn_cancel", lang), callback_data=CheckoutCb(step="cancel"))
    b.adjust(1)
    return b.as_markup()


def confirm_kb(lang: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    b.button(text=t("btn_confirm", lang), callback_data=CheckoutCb(step="confirm"))
    b.button(text=t("btn_cancel", lang), callback_data=CheckoutCb(step="cancel"))
    b.adjust(1)
    return b.as_markup()


def admin_order_kb(order_id: int, delivery_type: str) -> InlineKeyboardMarkup:
    b = InlineKeyboardBuilder()
    for status in ORDER_STATUSES:
        if delivery_type == "pickup" and status == "on_the_way":
            continue
        if delivery_type == "delivery" and status == "ready":
            continue
        b.button(text=t(f"status_{status}", "ru"), callback_data=StatusCb(order_id=order_id, status=status))
    b.adjust(2)
    return b.as_markup()
