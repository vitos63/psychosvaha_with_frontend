import logging

from aiogram.exceptions import TelegramBadRequest
from fastapi import APIRouter

from bot.instance import bot
from bot.storage.start_messages import pop_start_message_id_by_user

from .request import TgWebAppFormSubmittedRequest
from .response import TgWebAppFormSubmittedResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["tg-webapp"])


@router.post("/tg-webapp/form-submitted", response_model=TgWebAppFormSubmittedResponse)
async def form_submitted(request: TgWebAppFormSubmittedRequest):
    logger.info(
        "Requested keyboard removal tg_id=%s form_type=%s",
        request.tg_id,
        request.form_type,
    )

    chat_id, message_id = pop_start_message_id_by_user(request.tg_id)

    if chat_id is None or message_id is None:
        logger.info("No saved start message for tg_id=%s", request.tg_id)
        return TgWebAppFormSubmittedResponse(
            success=True,
            keyboard_removed=False,
            reason="message_not_found",
        )

    logger.info("Removing keyboard chat_id=%s message_id=%s", chat_id, message_id)
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

    return TgWebAppFormSubmittedResponse(success=True, keyboard_removed=True)
