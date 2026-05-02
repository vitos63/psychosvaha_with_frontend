import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.fsm.storage.memory import MemoryStorage

from config import BOT_TOKEN, TG_PROXY_URL
from .bot_factory import build_bot
from .dependencies import get_container
from .handlers.commands import command_router
from .handlers import commands


logging.basicConfig(level=logging.INFO)


bot = build_bot()
dp = Dispatcher(storage=MemoryStorage())
dp.include_router(command_router)


async def main():
    container = await get_container()
    container.wire(modules=[__name__, commands])
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
