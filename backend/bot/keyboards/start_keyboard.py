from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


start_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Продолжить",
                    callback_data="start_bot"
                )
            ]
        ]
    )


def get_no_therapists_keyboard(
    request_id: int,
) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Давайте",
                    callback_data=f"research_therapists:{request_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="Спасибо, не надо",
                    callback_data="start_bot",
                ),
            ],
        ],
    )
