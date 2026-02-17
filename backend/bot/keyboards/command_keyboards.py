from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo


start_keyboard = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://github.com/"))],
    [InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://github.com/vitos63"))],
])


start_keyboard_admin = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я администратор", callback_data="admin")],
    [InlineKeyboardButton(text="Я ищу специалиста", web_app=WebAppInfo(url="https://github.com/"))],
    [InlineKeyboardButton(text="Я специалист", web_app=WebAppInfo(url="https://github.com/vitos63"))],
])