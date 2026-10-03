from html import escape

from .config import Config
from .menu import Menu, localize
from .texts import money, t


def cart_lines(menu: Menu, cart: dict[str, int], lang: str, currency: str) -> tuple[list[str], int]:
    lines, subtotal = [], 0
    for item_id, qty in cart.items():
        item = menu.items.get(item_id)
        if not item:
            continue
        cost = item.price * qty
        subtotal += cost
        lines.append(f"• {escape(localize(item.name, lang))} × {qty} = {money(cost, currency)}")
    return lines, subtotal


def cart_text(menu: Menu, cart: dict[str, int], lang: str, config: Config) -> str:
    lines, subtotal = cart_lines(menu, cart, lang, config.currency)
    return "\n".join([t("cart_title", lang), "", *lines, "", f"<b>{t('subtotal', lang)}: {money(subtotal, config.currency)}</b>"])


def order_items_snapshot(menu: Menu, cart: dict[str, int]) -> list[dict]:
    """Saved with the order so later menu edits don't change old orders."""
    return [
        {"id": i, "name": localize(menu.items[i].name, "ru"), "price": menu.items[i].price, "qty": q}
        for i, q in cart.items()
        if i in menu.items
    ]


def order_summary(data: dict, menu: Menu, cart: dict[str, int], lang: str, config: Config) -> str:
    lines, subtotal = cart_lines(menu, cart, lang, config.currency)
    fee = config.delivery_fee if data["delivery_type"] == "delivery" else 0
    if data["delivery_type"] == "delivery":
        address = escape(data.get("address") or "")
        if data.get("latitude") is not None:
            address = f"{t('f_location', lang)} 📍" + (f", {address}" if address else "")
        place = f"{t('f_address', lang)}: {address}"
    else:
        place = t("pickup_address", lang, address=escape(config.cafe_address))
    parts = [
        t("confirm_title", lang),
        "",
        *lines,
        "",
        f"{t('f_type', lang)}: {t('btn_' + data['delivery_type'], lang)}",
        place,
        f"{t('f_phone', lang)}: {escape(data['phone'])}",
    ]
    if data.get("comment"):
        parts.append(f"{t('f_comment', lang)}: {escape(data['comment'])}")
    parts += [
        f"{t('f_payment', lang)}: {t('btn_' + data['payment'], lang)}",
        "",
        f"{t('subtotal', lang)}: {money(subtotal, config.currency)}",
    ]
    if fee:
        parts.append(f"{t('delivery_fee', lang)}: {money(fee, config.currency)}")
    parts.append(f"<b>{t('total', lang)}: {money(subtotal + fee, config.currency)}</b>")
    return "\n".join(parts)


def admin_order_text(order, user_name: str, username: str | None, items: list[dict], config: Config) -> str:
    who = escape(user_name) + (f" (@{username})" if username else "")
    lines = [f"• {escape(i['name'])} × {i['qty']} = {money(i['price'] * i['qty'], config.currency)}" for i in items]
    if order["delivery_type"] == "delivery":
        place = "🚚 Доставка: " + escape(order["address"] or "")
        if order["latitude"] is not None:
            place += f"\n🗺 https://maps.google.com/?q={order['latitude']},{order['longitude']}"
    else:
        place = "🏃 Самовывоз"
    parts = [
        f"📦 <b>Заказ №{order['id']}</b>",
        f"Статус: {t('status_' + order['status'], 'ru')}",
        "",
        f"👤 {who}",
        f"📱 {escape(order['phone'])}",
        place,
        f"💰 Оплата: {t('btn_' + order['payment'], 'ru')}",
    ]
    if order["comment"]:
        parts.append(f"💬 {escape(order['comment'])}")
    parts += ["", *lines, ""]
    if order["delivery_fee"]:
        parts.append(f"Доставка: {money(order['delivery_fee'], config.currency)}")
    parts.append(f"<b>Итого: {money(order['total'], config.currency)}</b>")
    return "\n".join(parts)
