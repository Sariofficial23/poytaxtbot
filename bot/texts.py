"""All user-facing texts in Russian (ru) and Uzbek (uz)."""

TEXTS = {
    "choose_lang": {
        "ru": "Выберите язык / Tilni tanlang",
        "uz": "Tilni tanlang / Выберите язык",
    },
    "welcome": {
        "ru": "Добро пожаловать в <b>{cafe}</b>! 🍽\nВыберите блюда в меню и оформите доставку прямо здесь.",
        "uz": "<b>{cafe}</b> ga xush kelibsiz! 🍽\nMenyudan taom tanlang va yetkazib berishni shu yerda rasmiylashtiring.",
    },
    "btn_menu": {"ru": "🍽 Меню", "uz": "🍽 Menyu"},
    "btn_cart": {"ru": "🛒 Корзина", "uz": "🛒 Savat"},
    "btn_orders": {"ru": "📦 Мои заказы", "uz": "📦 Buyurtmalarim"},
    "btn_contacts": {"ru": "☎️ Контакты", "uz": "☎️ Aloqa"},
    "btn_lang": {"ru": "🌐 Язык", "uz": "🌐 Til"},
    "btn_back": {"ru": "⬅️ Назад", "uz": "⬅️ Orqaga"},
    "btn_cancel": {"ru": "❌ Отмена", "uz": "❌ Bekor qilish"},
    "btn_skip": {"ru": "➡️ Пропустить", "uz": "➡️ O'tkazib yuborish"},
    "btn_add": {"ru": "🛒 Добавить в корзину", "uz": "🛒 Savatga qo'shish"},
    "btn_checkout": {"ru": "✅ Оформить заказ", "uz": "✅ Buyurtma berish"},
    "btn_clear": {"ru": "🗑 Очистить", "uz": "🗑 Tozalash"},
    "btn_delivery": {"ru": "🚚 Доставка", "uz": "🚚 Yetkazib berish"},
    "btn_pickup": {"ru": "🏃 Самовывоз", "uz": "🏃 Olib ketish"},
    "btn_send_location": {"ru": "📍 Отправить геолокацию", "uz": "📍 Joylashuvni yuborish"},
    "btn_send_phone": {"ru": "📱 Отправить номер", "uz": "📱 Raqamni yuborish"},
    "btn_cash": {"ru": "💵 Наличными", "uz": "💵 Naqd pul"},
    "btn_card": {"ru": "💳 Картой курьеру / переводом", "uz": "💳 Karta orqali / o'tkazma"},
    "btn_confirm": {"ru": "✅ Подтвердить", "uz": "✅ Tasdiqlash"},
    "categories": {"ru": "Выберите категорию:", "uz": "Kategoriyani tanlang:"},
    "items": {"ru": "<b>{category}</b>\nВыберите блюдо:", "uz": "<b>{category}</b>\nTaomni tanlang:"},
    "menu_empty": {"ru": "Меню пока пустое.", "uz": "Menyu hozircha bo'sh."},
    "item_card": {
        "ru": "<b>{name}</b>\n\n{description}\n\nЦена: <b>{price}</b>",
        "uz": "<b>{name}</b>\n\n{description}\n\nNarxi: <b>{price}</b>",
    },
    "added": {"ru": "✅ Добавлено: {name} × {qty}", "uz": "✅ Qo'shildi: {name} × {qty}"},
    "unavailable": {"ru": "Это блюдо сейчас недоступно.", "uz": "Bu taom hozir mavjud emas."},
    "cart_empty": {"ru": "🛒 Корзина пуста.", "uz": "🛒 Savat bo'sh."},
    "cart_title": {"ru": "🛒 <b>Ваша корзина:</b>", "uz": "🛒 <b>Savatingiz:</b>"},
    "subtotal": {"ru": "Сумма", "uz": "Summa"},
    "delivery_fee": {"ru": "Доставка", "uz": "Yetkazib berish"},
    "total": {"ru": "Итого", "uz": "Jami"},
    "cart_cleared": {"ru": "Корзина очищена.", "uz": "Savat tozalandi."},
    "closed": {
        "ru": "😴 Сейчас мы закрыты. Часы работы: {hours}.\nЗаказ можно будет оформить в рабочее время.",
        "uz": "😴 Hozir yopiqmiz. Ish vaqti: {hours}.\nBuyurtmani ish vaqtida berishingiz mumkin.",
    },
    "min_order": {
        "ru": "Минимальная сумма заказа — {amount}. Добавьте ещё что-нибудь 🙂",
        "uz": "Minimal buyurtma summasi — {amount}. Yana biror narsa qo'shing 🙂",
    },
    "ask_delivery_type": {"ru": "Как вы хотите получить заказ?", "uz": "Buyurtmani qanday olmoqchisiz?"},
    "ask_location": {
        "ru": "📍 Отправьте геолокацию кнопкой ниже или напишите адрес текстом (улица, дом, подъезд, ориентир).",
        "uz": "📍 Quyidagi tugma orqali joylashuvni yuboring yoki manzilni yozing (ko'cha, uy, mo'ljal).",
    },
    "ask_address_details": {
        "ru": "Уточните адрес: дом, подъезд, этаж, квартира, ориентир. Или нажмите «Пропустить».",
        "uz": "Manzilni aniqlashtiring: uy, podyezd, qavat, xonadon, mo'ljal. Yoki «O'tkazib yuborish» tugmasini bosing.",
    },
    "ask_phone": {
        "ru": "📱 Отправьте номер телефона кнопкой ниже или напишите его в формате +998901234567.",
        "uz": "📱 Quyidagi tugma orqali telefon raqamingizni yuboring yoki +998901234567 formatida yozing.",
    },
    "bad_phone": {"ru": "Неверный номер. Пример: +998901234567", "uz": "Noto'g'ri raqam. Namuna: +998901234567"},
    "ask_comment": {
        "ru": "💬 Комментарий к заказу (например, «без лука»)? Или нажмите «Пропустить».",
        "uz": "💬 Buyurtmaga izoh (masalan, «piyozsiz»)? Yoki «O'tkazib yuborish» tugmasini bosing.",
    },
    "ask_payment": {"ru": "💰 Выберите способ оплаты:", "uz": "💰 To'lov usulini tanlang:"},
    "confirm_title": {"ru": "📝 <b>Проверьте заказ:</b>", "uz": "📝 <b>Buyurtmani tekshiring:</b>"},
    "f_type": {"ru": "Получение", "uz": "Olish usuli"},
    "f_address": {"ru": "Адрес", "uz": "Manzil"},
    "f_phone": {"ru": "Телефон", "uz": "Telefon"},
    "f_comment": {"ru": "Комментарий", "uz": "Izoh"},
    "f_payment": {"ru": "Оплата", "uz": "To'lov"},
    "f_location": {"ru": "геолокация", "uz": "joylashuv"},
    "pickup_address": {"ru": "Самовывоз: {address}", "uz": "Olib ketish: {address}"},
    "order_placed": {
        "ru": "✅ Заказ <b>№{id}</b> принят! Мы скоро свяжемся с вами.\nСтатус заказа будет приходить сюда.",
        "uz": "✅ <b>№{id}</b> buyurtma qabul qilindi! Tez orada siz bilan bog'lanamiz.\nBuyurtma holati shu yerga keladi.",
    },
    "order_cancelled_by_user": {"ru": "Оформление отменено.", "uz": "Rasmiylashtirish bekor qilindi."},
    "no_orders": {"ru": "У вас пока нет заказов.", "uz": "Sizda hali buyurtmalar yo'q."},
    "my_orders": {"ru": "📦 <b>Последние заказы:</b>", "uz": "📦 <b>Oxirgi buyurtmalar:</b>"},
    "contacts": {
        "ru": "<b>{cafe}</b>\n☎️ {phone}\n📍 {address}\n🕒 Часы работы: {hours}",
        "uz": "<b>{cafe}</b>\n☎️ {phone}\n📍 {address}\n🕒 Ish vaqti: {hours}",
    },
    "status_changed": {
        "ru": "Заказ <b>№{id}</b>: {status}",
        "uz": "<b>№{id}</b> buyurtma: {status}",
    },
    "status_new": {"ru": "🆕 Новый", "uz": "🆕 Yangi"},
    "status_accepted": {"ru": "👍 Принят", "uz": "👍 Qabul qilindi"},
    "status_cooking": {"ru": "👨‍🍳 Готовится", "uz": "👨‍🍳 Tayyorlanmoqda"},
    "status_on_the_way": {"ru": "🚚 В пути", "uz": "🚚 Yo'lda"},
    "status_ready": {"ru": "🛍 Готов к выдаче", "uz": "🛍 Olib ketishga tayyor"},
    "status_delivered": {"ru": "✅ Выполнен", "uz": "✅ Bajarildi"},
    "status_cancelled": {"ru": "❌ Отменён", "uz": "❌ Bekor qilindi"},
    "unknown": {
        "ru": "Не понял 🤔 Воспользуйтесь кнопками меню.",
        "uz": "Tushunmadim 🤔 Menyu tugmalaridan foydalaning.",
    },
}


def t(key: str, lang: str | None, **kwargs) -> str:
    entry = TEXTS[key]
    text = entry.get(lang or "ru") or entry["ru"]
    return text.format(**kwargs) if kwargs else text


def all_variants(key: str) -> set[str]:
    """Every translation of a button label, used to match reply-keyboard presses."""
    return set(TEXTS[key].values())


def money(amount: int, currency: str) -> str:
    return f"{amount:,}".replace(",", " ") + f" {currency}"
