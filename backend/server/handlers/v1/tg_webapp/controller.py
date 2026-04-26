import logging

from aiogram.exceptions import TelegramBadRequest
from fastapi import APIRouter

from bot.client import get_bot
from bot.storage.start_messages import pop_start_message_id, pop_start_message_id_by_user

from .request import TgWebAppFormSubmittedRequest
from .response import TgWebAppFormSubmittedResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["tg-webapp"])


@router.post("/tg-webapp/form-submitted", response_model=TgWebAppFormSubmittedResponse)
async def form_submitted(request: TgWebAppFormSubmittedRequest):
    message_id = pop_start_message_id(chat_id=request.tg_id, user_id=request.tg_id)
    chat_id = request.tg_id

    if message_id is None:
        chat_id, message_id = pop_start_message_id_by_user(request.tg_id)

    if chat_id is None or message_id is None:
        logger.info(
            "No start message id in storage for tg_id=%s form_type=%s",
            request.tg_id,
            request.type,
        )
        return TgWebAppFormSubmittedResponse(success=True)

    bot = get_bot()
    try:
        await bot.edit_message_reply_markup(
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

    try:
        await bot.send_message(chat_id=chat_id, text="Данные формы получены ✅")
    except TelegramBadRequest as exc:
        logger.warning(
            "Failed to send success message to chat_id=%s: %s",
            chat_id,
            exc,
        )

    return TgWebAppFormSubmittedResponse(success=True)
