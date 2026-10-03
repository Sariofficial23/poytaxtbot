import os
from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()


def _int_list(value: str) -> list[int]:
    return [int(x) for x in value.replace(" ", "").split(",") if x]


def _parse_hours(value: str) -> tuple[time, time]:
    start, end = value.split("-")
    return time.fromisoformat(start.strip()), time.fromisoformat(end.strip())


@dataclass(frozen=True)
class Config:
    bot_token: str
    admin_ids: list[int]
    orders_chat_id: int | None
    cafe_name: str
    cafe_phone: str
    cafe_address: str
    currency: str
    delivery_fee: int
    min_order: int
    work_hours: tuple[time, time]
    utc_offset: int
    db_path: str
    menu_path: str

    def now(self) -> datetime:
        return datetime.now(timezone(timedelta(hours=self.utc_offset)))

    def is_open(self) -> bool:
        start, end = self.work_hours
        current = self.now().time()
        if start <= end:
            return start <= current <= end
        # e.g. 18:00-03:00 (works past midnight)
        return current >= start or current <= end


def load_config() -> Config:
    token = os.getenv("BOT_TOKEN", "")
    if not token:
        raise RuntimeError("BOT_TOKEN не задан. Скопируйте .env.example в .env и заполните его.")
    orders_chat = os.getenv("ORDERS_CHAT_ID", "").strip()
    return Config(
        bot_token=token,
        admin_ids=_int_list(os.getenv("ADMIN_IDS", "")),
        orders_chat_id=int(orders_chat) if orders_chat else None,
        cafe_name=os.getenv("CAFE_NAME", "Poytaxt"),
        cafe_phone=os.getenv("CAFE_PHONE", ""),
        cafe_address=os.getenv("CAFE_ADDRESS", ""),
        currency=os.getenv("CURRENCY", "сум"),
        delivery_fee=int(os.getenv("DELIVERY_FEE", "0")),
        min_order=int(os.getenv("MIN_ORDER", "0")),
        work_hours=_parse_hours(os.getenv("WORK_HOURS", "00:00-23:59")),
        utc_offset=int(os.getenv("UTC_OFFSET", "5")),
        db_path=os.getenv("DB_PATH", "data/bot.db"),
        menu_path=os.getenv("MENU_PATH", "menu.json"),
    )
