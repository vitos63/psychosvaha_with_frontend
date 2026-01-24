from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ClientRequest
from dto.client_request import CreateClientRequest


class ClientRequestRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_request(self, dto: CreateClientRequest) -> ClientRequest:
        client_request = ClientRequest(
            client_id=dto.client_id,
            problem_description=dto.problem_description,
            sex=dto.sex,
            age=dto.age,
            city=dto.city,
            is_online=dto.is_online,
            currency_amount=dto.currency_amount,
            psychotherapist_sex=dto.psychotherapist_sex,
        )
        self._session.add(client_request)
        await self._session.flush()
        return client_request
