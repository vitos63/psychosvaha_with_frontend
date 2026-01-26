from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from config import DB_URL

engine = create_async_engine(DB_URL)
AsyncSessionFactory = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
