from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.models import ClientRequestTag, Tag


class ClientRequestTagRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_request_tag(self, request_id: int, tag_id: int) -> ClientRequestTag:
        client_request = ClientRequestTag(
            request_id=request_id,
            tag_id=tag_id,
        )
        self._session.add(client_request)
        await self._session.flush()
        return client_request

    async def update_request_tags(self, request_id: int, tags: list[str]) -> ClientRequestTag:
        stmt = (
            select(Tag)
            .where(Tag.title in tags)
            )
        result = await self._session.execute(stmt)
        tags_ids = list(result.scalars().all())
        stmt = (
            delete(ClientRequestTag)
            .where(ClientRequestTag.request_id == request_id)
        )
        await self._session.execute(stmt)
        for tag_id in tags_ids:
            await self.create_request_tag(request_id=request_id, tag_id=tag_id)

    async def select_by_request_id(self, request_id: int) -> list[ClientRequestTag]:
        stmt = (
            select(ClientRequestTag)
            .where(ClientRequestTag.request_id == request_id)
            .options(selectinload(ClientRequestTag.tag))
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
