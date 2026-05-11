from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from constants import BASE_URL


def get_client_keyboard(request_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Посмотреть",
                    web_app=WebAppInfo(url=f"{BASE_URL}/selected_therapists/{request_id}")
                )
            ]
        ]
    )
