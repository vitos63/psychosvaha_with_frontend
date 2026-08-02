import logging

from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest

from bot.storage.start_messages import pop_start_message_id_by_user
from bot.keyboards.start_keyboard import start_keyboard

logger = logging.getLogger(__name__)


async def remove_start_keyboard_for_user(bot: Bot, user_id: int) -> bool:
    chat_id, message_id = await pop_start_message_id_by_user(user_id)

    if chat_id is None or message_id is None:
        logger.info("No saved start keyboard message for user_id=%s", user_id)
        return False

    logger.info(
        "Trying to remove start keyboard for user_id=%s chat_id=%s message_id=%s",
        user_id,
        chat_id,
        message_id,
    )

    try:
        await bot.edit_message_reply_markup(
            chat_id=chat_id,
            message_id=message_id,
            reply_markup=start_keyboard,
        )
        logger.info(
            "Start keyboard removed for user_id=%s chat_id=%s message_id=%s",
            user_id,
            chat_id,
            message_id,
        )
        return True
    except TelegramBadRequest as exc:
        logger.warning(
            "Failed to remove start keyboard for user_id=%s chat_id=%s message_id=%s: %s",
            user_id,
            chat_id,
            message_id,
            exc,
        )
        return False
