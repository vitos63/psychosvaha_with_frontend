import json
import logging

from aiogram import F, Router
from aiogram.types import Message

from bot.services.start_keyboard import remove_start_keyboard_for_user

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
        await remove_start_keyboard_for_user(bot=message.bot, user_id=user_id)

    logger.info("Received web_app_data from user_id=%s payload=%s", user_id, payload)
    await message.answer("Данные формы получены ✅")
