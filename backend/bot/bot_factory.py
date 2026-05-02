from aiogram import Bot
from aiogram.client.session.aiohttp import AiohttpSession

from config import BOT_TOKEN, TG_PROXY_URL


def build_bot() -> Bot:
    if TG_PROXY_URL:
        session = AiohttpSession(proxy=TG_PROXY_URL)
        return Bot(token=BOT_TOKEN, session=session)
    return Bot(token=BOT_TOKEN)
