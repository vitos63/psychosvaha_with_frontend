from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ClientRequest, ClientRequestTag, Tag
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
            need_psychiatrist=dto.need_psychiatrist,
        )
        self._session.add(client_request)
        await self._session.flush()
        return client_request

    async def select_by_request_id(self, request_id: int) -> ClientRequest | None:
        stmt = (
            select(ClientRequest)
            .where(
                ClientRequest.id == request_id,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalars().first()

    async def select_tags_by_request_id(self, request_id: int) -> list[Tag]:
        stmt = (
            select(Tag)
            .join(
                ClientRequestTag,
                Tag.id == ClientRequestTag.tag_id
            )
            .where(
                ClientRequestTag.request_id == request_id,
            )
        )

        result = await self._session.execute(stmt)
        tags = result.scalars().all()
        return tags

    async def select_by_tg_id(self, tg_id: int) -> ClientRequest | None:
        stmt = (
            select(ClientRequest)
            .where(
                ClientRequest.client_id == tg_id,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalars().first()

    async def get_not_approved_client_requests(self) -> list[dict]:
        stmt = (
            select(ClientRequest.id, ClientRequest.problem_description, Tag.title)
            .join(ClientRequestTag, ClientRequest.id == ClientRequestTag.request_id)
            .join(Tag, ClientRequestTag.tag_id == Tag.id)
            .where(
                ClientRequest.is_approved == False
                )
            )
        result = await self._session.execute(stmt)
        return result.mappings().all()

    async def approve_client_request(self, client_request_id: int):
        stmt = (
            select(ClientRequest)
            .where(
                ClientRequest.id == client_request_id
            )
        )
        result = await self._session.execute(stmt)
        client_request = result.scalar_one()
        client_request.is_approved = True
        await self._session.flush()
