import logging

from fastapi import APIRouter

from bot.dependencies import BOT
from bot.services.start_keyboard import remove_start_keyboard_for_user

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

    keyboard_removed = await remove_start_keyboard_for_user(bot=BOT, user_id=request.tg_id)
    reason = None if keyboard_removed else "message_not_found_or_uneditable"
    return TgWebAppFormSubmittedResponse(success=True, keyboard_removed=keyboard_removed, reason=reason)
