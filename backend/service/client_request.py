from sqlalchemy.ext.asyncio import AsyncSession

from dto.client_request import CreateClientRequest
from repo.client_requests import ClientRequestRepo


class ClientRequestService:
    def __init__(
            self,
            session: AsyncSession,
            client_request_repo: ClientRequestRepo,
    ):
        self._session = session
        self._client_request_repo = client_request_repo

    async def create_client_request(self, request: CreateClientRequest):
        request = await self._client_request_repo.create_request(request)
        await self._session.commit()
        return request
