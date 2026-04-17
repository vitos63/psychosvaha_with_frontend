from aiogram import Router
from aiogram import F
from aiogram.types import Message

from enums.bot_messages import BotMessages
from modules.di.container import Container


role_router = Router()


@role_router.message(F.data == "client")
async def client_handler(message: Message):
    pass


@role_router.message(F.data == "therapist")
async def therapist_handler(message: Message):
    pass