import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from config import DB_URL
from modules.di.container import Container
from repo.client_requests import ClientRequestRepo
from repo.client_requests_tags import ClientRequestTagRepo
from server.main import app


@pytest.fixture(scope="session")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest.fixture(scope="session")
async def engine() -> AsyncEngine:
    engine = create_async_engine(DB_URL)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session(engine: AsyncEngine) -> AsyncSession:
    async with async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)() as db_connection:
        yield db_connection


@pytest.fixture
async def container(db_session: AsyncSession) -> Container:
    return Container(session=db_session)


@pytest.fixture
async def client_request_repo(container: Container) -> ClientRequestRepo:
    return container.client_request_repo()


@pytest.fixture
async def client_request_tag_repo(container: Container) -> ClientRequestTagRepo:
    return container.client_request_tag_repo()
