from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import redis.asyncio as redis

from config import DB_URL

engine = create_async_engine(DB_URL)
AsyncSessionFactory = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


redis = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True,
)
