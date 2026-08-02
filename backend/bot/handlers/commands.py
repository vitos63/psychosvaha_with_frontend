import logging

from aiogram import Bot, Router, F
from aiogram.filters.command import Command
from aiogram.types import Message, CallbackQuery
from dependency_injector.wiring import Provide, inject
from typing import Annotated

from enums.bot_messages import BotMessages
from service.admin import AdminService
from service.therapist import TherapistService
from service.client_request import ClientRequestService
from enums.therapist_statuses import TherapistStatuses
from modules.di.container import Container
from bot.keyboards.command_keyboards import CommandKeyboardBuilder
from bot.storage.start_messages import set_start_message_id
from bot.services.start_keyboard import remove_start_keyboard_for_user

command_router = Router()
logger = logging.getLogger(__name__)


@command_router.message(Command("start"))
async def command_start_message(message: Message, bot: Bot):
    await start_handler(bot=bot, user_id=message.from_user.id, chat_id=message.chat.id)


@command_router.callback_query(F.data == "start_bot")
async def command_start_callback(callback: CallbackQuery, bot: Bot):
    await callback.answer()
    await start_handler(bot=bot, user_id=callback.from_user.id, chat_id=callback.message.chat.id)


@inject
async def start_handler(user_id: int,
                        chat_id: int,
                        bot: Bot,
                        admin_service: Annotated[AdminService, Provide[Container.admin_service]],
                        therapist_service: Annotated[TherapistService, Provide[Container.therapist_service]],
                        client_request_service: Annotated[ClientRequestService, Provide[Container.client_request_service]]):
    answer = BotMessages.start_command.value
    admin = await admin_service.check_is_admin(tg_id=user_id)
    therapist = await therapist_service.get_therapist_by_tg_id(therapist_tg_id=user_id)
    client_request = await client_request_service.get_client_request_by_tg_id(tg_id=user_id)
    if therapist:
        keyboard = CommandKeyboardBuilder(is_admin=bool(admin),
                                          has_client_request=bool(client_request),
                                          therapist_status=therapist.status.value,
                                          tg_id=user_id).get_start_keyboard()

    else:
        keyboard = CommandKeyboardBuilder(is_admin=bool(admin),
                                          has_client_request=bool(client_request),
                                          therapist_status=TherapistStatuses.NO_QUESTIONARY.value,
                                          tg_id=user_id).get_start_keyboard()

    await remove_start_keyboard_for_user(bot, user_id)
    sent_message = await bot.send_message(chat_id=chat_id, text=answer, reply_markup=keyboard, parse_mode="HTML")
    await set_start_message_id(chat_id=chat_id, user_id=user_id, message_id=sent_message.message_id)
    logger.info(
        "Saved start message chat_id=%s user_id=%s message_id=%s",
        chat_id,
        user_id,
        sent_message.message_id,
    )
