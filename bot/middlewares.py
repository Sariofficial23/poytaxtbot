from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User

from .db import Database


class UserMiddleware(BaseMiddleware):
    """Registers the user and injects `lang` into every handler."""

    def __init__(self, db: Database):
        self.db = db

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        user: User | None = data.get("event_from_user")
        lang = "ru"
        if user and not user.is_bot:
            row = await self.db.get_user(user.id)
            if row is None:
                await self.db.upsert_user(user.id, user.full_name, user.username)
                data["lang_chosen"] = False
            else:
                lang = row["lang"] or "ru"
                data["lang_chosen"] = bool(row["lang"])
        data["lang"] = lang
        return await handler(event, data)
