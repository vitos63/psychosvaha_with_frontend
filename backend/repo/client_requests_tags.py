from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ClientRequestTag


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
