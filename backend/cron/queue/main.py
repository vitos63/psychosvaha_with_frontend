import asyncio

from config import CONSUMER_BATCH_SIZE, CONSUMER_SLEEP_SECONDS
from cron.queue.consumer import QueueConsumer
from database.engine import AsyncSessionFactory
from modules.di.container import Container


async def main():
    consumer = QueueConsumer(
        session_factory=AsyncSessionFactory,
        container_factory=Container,
        batch_size=CONSUMER_BATCH_SIZE,
        sleep_seconds=CONSUMER_SLEEP_SECONDS,
    )
    # TODO: graceful shutdown
    task = asyncio.create_task(consumer.run())
    try:
        await task
    except (KeyboardInterrupt, asyncio.CancelledError):
        consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())
