import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.fsm.storage.memory import MemoryStorage

from config import BOT_TOKEN, TG_PROXY_URL
from .dependencies import get_container
from .handlers.commands import command_router
from .handlers import commands


logging.basicConfig(level=logging.INFO)


def _build_bot() -> Bot:
    if TG_PROXY_URL:
        session = AiohttpSession(proxy=TG_PROXY_URL)
        return Bot(token=BOT_TOKEN, session=session)
    return Bot(token=BOT_TOKEN)


bot = _build_bot()
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
