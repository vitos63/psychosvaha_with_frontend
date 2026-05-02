from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from constants import BASE_URL


admin_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Посмотреть",
                web_app=WebAppInfo(url=f"{BASE_URL}/admin")
            )
        ]
    ]
)