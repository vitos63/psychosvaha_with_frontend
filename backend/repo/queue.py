from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.base_task import BaseTask
from database.models import Queue
from dto.enums import QueueStatus


class QueueRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_task(self, task: BaseTask, start_at: datetime) -> Queue:
        item = Queue(
            type=task.get_type(),
            payload=task.to_dict(),
            start_at=start_at,
            finished_at=None,
            status=QueueStatus.READY,
        )
        self._session.add(item)
        await self._session.flush()
        return item

    async def select_ready(
            self,
            start_at: datetime,
            limit: int,
    ) -> list[Queue]:
        stmt = (
            select(Queue)
            .where(
                Queue.status == QueueStatus.READY,
                Queue.start_at <= start_at,
            )
            .order_by(Queue.id)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
