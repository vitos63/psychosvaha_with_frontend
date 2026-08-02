import asyncio
import logging

from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

from .dependencies import get_container
from .handlers import commands, reseach_therapists
from .handlers.commands import command_router
from .handlers.web_app import web_app_router
from .handlers.reseach_therapists import research_router

logging.basicConfig(level=logging.INFO)

dp = Dispatcher(storage=MemoryStorage())
dp.include_router(command_router)
dp.include_router(web_app_router)
dp.include_router(research_router)


async def main():
    container = await get_container()
    bot = container.bot()
    container.wire(modules=[__name__, commands, reseach_therapists])
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
