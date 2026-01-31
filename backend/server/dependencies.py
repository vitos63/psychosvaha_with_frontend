from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import AsyncSessionFactory
from modules.di.container import Container
from service.client_request import ClientRequestService
from service.therapist import TherapistService


async def db_session() -> AsyncSession:
    async with AsyncSessionFactory() as db_connection:
        return db_connection


async def container(session: Annotated[AsyncSession, Depends(db_session)]) -> Container:
    return Container(session=session)


async def client_request_service(container_: Annotated[Container, Depends(container)]) -> ClientRequestService:
    return container_.client_request_service()


async def therapist_service(container_: Annotated[Container, Depends(container)]) -> TherapistService:
    return container_.therapist_service()
