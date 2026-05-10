from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from constants import BASE_URL


client_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Посмотреть",
                web_app=WebAppInfo(url=f"{BASE_URL}/selected_therapists")
            )
        ]
    ]
)