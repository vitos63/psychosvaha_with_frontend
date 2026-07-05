from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import AsyncSessionFactory
from modules.di.container import Container


async def db_session() -> AsyncSession:
    async with AsyncSessionFactory() as db_connection:
        return db_connection


async def get_container() -> Container:
    session = await db_session()
    return Container(session=session)
