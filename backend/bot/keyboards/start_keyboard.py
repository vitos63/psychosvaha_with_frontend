from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from constants import BASE_URL


def get_start_keyboard(request_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Продолжить",
                    callback_data="start_bot"
                )
            ]
        ]
    )
