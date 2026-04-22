from aiogram import Router
from aiogram.filters.command import Command
from aiogram.types import Message
from dependency_injector.wiring import Provide, inject
from typing import Annotated

from enums.bot_messages import BotMessages
from service.admin_service import AdminService
from service.therapist import TherapistService
from service.client_request import ClientRequestService
from enums.therapist_statuses import TherapistStatuses
from modules.di.container import Container
from bot.keyboards.command_keyboards import CommandKeyboardBuilder

command_router = Router()


@command_router.message(Command("start"))
@inject
async def start_handler(message: Message,
                        admin_service: Annotated[AdminService, Provide[Container.admin_service]],
                        therapist_service: Annotated[TherapistService, Provide[Container.therapist_service]],
                        client_request_service: Annotated[ClientRequestService, Provide[Container.client_request_service]]):
    answer = BotMessages.start_command.value
    user_id = message.from_user.id
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

    await message.answer(answer, reply_markup=keyboard)
