from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from constants import BASE_URL


therapist_second_form_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Продолжить заполнение анкеты",
                web_app=WebAppInfo(url=f"{BASE_URL}/form-therapist-second")
            )
        ]
    ]
)