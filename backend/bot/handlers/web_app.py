import json
import logging

from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import Message

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

    reply_message = message.reply_to_message
    if not reply_message:
        logger.info("No reply_to_message for web_app_data message_id=%s", message.message_id)
    else:
        try:
            await message.bot.edit_message_reply_markup(
                chat_id=message.chat.id,
                message_id=reply_message.message_id,
                reply_markup=None,
            )
        except TelegramBadRequest as exc:
            logger.warning(
                "Failed to remove inline keyboard chat_id=%s message_id=%s: %s",
                message.chat.id,
                reply_message.message_id,
                exc,
            )

    logger.info("Received web_app_data from user_id=%s payload=%s", user_id, payload)
    await message.answer("Данные формы получены ✅")
