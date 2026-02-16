from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


start_keyboard = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я ищу специалиста", callback_data="client")],
    [InlineKeyboardButton(text="Я специалист", callback_data="therapist")],
])


start_keyboard_admin = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Я администратор", callback_data="admin")],
    [InlineKeyboardButton(text="Я ищу специалиста", callback_data="client")],
    [InlineKeyboardButton(text="Я специалист", callback_data="therapist")],
])