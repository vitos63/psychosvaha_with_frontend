from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Tag


class TagRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def select_all(self) -> list[Tag]:
        stmt = (
            select(Tag)
            .order_by(Tag.id)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
