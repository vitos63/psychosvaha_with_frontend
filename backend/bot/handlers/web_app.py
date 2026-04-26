import json
import logging

from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import Message

from bot.storage.start_messages import pop_start_message_id_by_user

web_app_router = Router()
logger = logging.getLogger(__name__)


@web_app_router.message(F.web_app_data)
async def webapp_data_handler(message: Message):
    user_id = message.from_user.id if message.from_user else None
    payload_raw = message.web_app_data.data
    payload = payload_raw

    try:
        payload = json.loads(payload_raw)
    except json.JSONDecodeError:
        logger.warning("Received non-JSON web_app_data from user_id=%s: %s", user_id, payload_raw)

    if user_id is not None:
        chat_id, message_id = pop_start_message_id_by_user(user_id)

        if chat_id is None or message_id is None:
            logger.info("No saved start message for web_app_data user_id=%s", user_id)
        else:
            try:
                await message.bot.edit_message_reply_markup(
                    chat_id=chat_id,
                    message_id=message_id,
                    reply_markup=None,
                )
            except TelegramBadRequest as exc:
                logger.warning(
                    "Failed to remove inline keyboard chat_id=%s message_id=%s: %s",
                    chat_id,
                    message_id,
                    exc,
                )

    logger.info("Received web_app_data from user_id=%s payload=%s", user_id, payload)
    await message.answer("Данные формы получены ✅")
