from aiogram import Bot
from aiogram.client.session.aiohttp import AiohttpSession

from config import BOT_TOKEN, TG_PROXY_URL


_cached_bot: Bot | None = None


def get_bot() -> Bot:
    global _cached_bot

    if _cached_bot is not None:
        return _cached_bot

    if TG_PROXY_URL:
        session = AiohttpSession(proxy=TG_PROXY_URL)
        _cached_bot = Bot(token=BOT_TOKEN, session=session)
        return _cached_bot

    _cached_bot = Bot(token=BOT_TOKEN)
    return _cached_bot
