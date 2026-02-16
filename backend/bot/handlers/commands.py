from aiogram import Router
from aiogram.filters.command import Command
from aiogram.types import Message
from dependency_injector.wiring import Provide, inject
from typing import Annotated

from enums.bot_messages import BotMessages
from service.admin_service import AdminService
from ..keyboards.command_keyboards import (start_keyboard_admin,
                                           start_keyboard)
from modules.di.container import Container

command_router = Router()


@command_router.message(Command("start"))
@inject
async def start_handler(message: Message,
                        admin_service: Annotated[AdminService, Provide[Container.admin_service]]):
    answer = BotMessages.start_command.value
    user_id = message.from_user.id
    admin = await admin_service.check_is_admin(tg_id=user_id)
    if admin:
        keyboard = start_keyboard_admin

    else:
        keyboard = start_keyboard

    await message.answer(answer, reply_markup=keyboard)
