from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import AsyncSessionFactory
from modules.di.container import Container


async def db_session() -> AsyncSession:
    async with AsyncSessionFactory() as db_connection:
        return db_connection


async def get_container() -> Container:
    session = await db_session()
    return Container(session=session)

def _build_bot() -> Bot:
    if TG_PROXY_URL:
        session = AiohttpSession(proxy=TG_PROXY_URL)
        return Bot(token=BOT_TOKEN, session=session)
    return Bot(token=BOT_TOKEN)