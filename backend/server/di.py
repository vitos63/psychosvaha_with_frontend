from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import AsyncSessionFactory
from repo.client_requests import ClientRequestRepo
from service.client_request import ClientRequestService


async def db_session() -> AsyncSession:
    async with AsyncSessionFactory() as db_connection:
        return db_connection


async def client_request_repo(session: Annotated[AsyncSession, Depends(db_session)]) -> ClientRequestRepo:
    return ClientRequestRepo(session)


async def client_request_service(
    session: Annotated[AsyncSession, Depends(db_session)],
    cr_repo: Annotated[ClientRequestRepo, Depends(client_request_repo)],
) -> ClientRequestService:
    return ClientRequestService(session, cr_repo)
