import asyncio
import logging

from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

from .instance import bot
from .dependencies import get_container
from .handlers import commands
from .handlers.commands import command_router
from .handlers.web_app import web_app_router

logging.basicConfig(level=logging.INFO)

dp = Dispatcher(storage=MemoryStorage())
dp.include_router(command_router)
dp.include_router(web_app_router)


async def main():
    container = await get_container()
    container.wire(modules=[__name__, commands])
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
