import logging

from aiogram import Bot, Router, F
from aiogram.types import CallbackQuery
from dependency_injector.wiring import Provide, inject
from typing import Annotated

from service.client_request import ClientRequestService
from modules.di.container import Container
from bot.services.start_keyboard import remove_start_keyboard_for_user

research_router = Router()
logger = logging.getLogger(__name__)


@research_router.callback_query(F.data.startswith("research_therapists:"))
async def research_therapists(bot: Bot, callback: CallbackQuery):
    await callback.answer()
    await research_therapists_handler(bot=bot, callback=callback)


@inject
async def research_therapists_handler(callback: CallbackQuery,
                        bot: Bot,
                        client_request_service: Annotated[ClientRequestService, Provide[Container.client_request_service]]):
    user_id = callback.from_user.id
    try:
        request_id = int(
            callback.data.split(":", maxsplit=1)[1]
        )
    except (ValueError, IndexError):
        await callback.answer(
            "Некорректная заявка",
            show_alert=True,
        )
        return
    await client_request_service.research_therapists(request_id=request_id, client_id=client_request.client_id)
    await remove_start_keyboard_for_user(bot, user_id)
