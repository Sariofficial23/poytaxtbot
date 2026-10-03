from aiogram import Router
from aiogram.types import CallbackQuery, Message

from ..keyboards import main_kb
from ..texts import t

router = Router(name="fallback")


@router.message()
async def unknown_message(message: Message, lang: str):
    if message.chat.type == "private":
        await message.answer(t("unknown", lang), reply_markup=main_kb(lang))


@router.callback_query()
async def stale_callback(call: CallbackQuery):
    # Button from an old message (e.g. after a restart or a finished checkout).
    await call.answer()
