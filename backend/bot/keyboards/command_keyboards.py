from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo


start_keyboard = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://psychosvaha.ru/form-client"))],
    [InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/form-thrapist-first"))],
])


start_keyboard_admin = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я администратор", callback_data="admin")],
    [InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://psychosvaha.ru/form-client"))],
    [InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://psychosvaha.ru/form-thrapist-first"))],
])