import asyncio
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
import logging

from config import BOT_TOKEN
from .dependencies import get_container
from modules.di.container import Container
from .handlers.commands import command_router
from .handlers import commands


logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN, proxy="socks5://IP:1080")
dp = Dispatcher(storage=MemoryStorage())
dp.include_router(command_router)


async def main():
    container: Container = await get_container()
    container.wire(modules=[__name__, commands])
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
