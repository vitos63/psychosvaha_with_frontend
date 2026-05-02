from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from constants import BASE_URL


admin_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Посмотреть",
                callback_data=f"{BASE_URL}/admin"
            )
        ]
    ]
)