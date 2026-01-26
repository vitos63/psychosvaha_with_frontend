import asyncio
from typing import Callable

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from config import CONSUMER_BATCH_SIZE, CONSUMER_SLEEP_SECONDS
from cron.queue.errors import UnknownTaskError, UnknownProcessorError
from cron.queue.tasks.add_tags_to_client_request.task import AddTagsToRequestTask
from cron.queue.tasks.base_processor import BaseProcessor
from cron.queue.tasks.base_task import BaseTask
from database.models import Queue
from dto.enums import QueueStatus
from modules.di.container import Container


class QueueConsumer:
    def __init__(
            self,
            session_factory: Callable[..., AsyncSession],
            container_factory: Callable[..., Container],
            batch_size: int = CONSUMER_BATCH_SIZE,
            sleep_seconds: float = CONSUMER_SLEEP_SECONDS,
    ):
        self._session_factory = session_factory
        self._container_factory = container_factory
        self._batch_size = batch_size
        self._sleep_seconds = sleep_seconds
        self._type_to_task_cls: dict[str, type[BaseTask]] = {
            AddTagsToRequestTask.get_type(): AddTagsToRequestTask,
        }
        self._stop_event = asyncio.Event()

    async def run(self):
        logger.info("Consumer started")

        while not self._stop_event.is_set():
            async with self._session_factory() as session:
                container = self._container_factory(session=session)
                queue_repo = container.queue_repo()

                ready_tasks = await queue_repo.select_ready(
                    start_at=container.date_time_service().get_current_time(),
                    limit=self._batch_size,
                )

                if not ready_tasks:
                    await asyncio.sleep(self._sleep_seconds)
                    continue

                for task in ready_tasks:
                    try:
                        await self._handle_task(task, container)
                    except Exception as e:
                        logger.error(f"Failed to process task: {task.id=}\n{e}")
                        task.status = QueueStatus.ERROR
                    else:
                        task.status = QueueStatus.DONE
                    finally:
                        await session.commit()

        logger.info("Consumer stopped")

    async def _handle_task(self, task: Queue, container: Container):
        task_cls = self._type_to_task_cls.get(task.type)
        if not task_cls:
            raise UnknownTaskError(f"Unknown task type: {task.type}")

        processor_name = task_cls.get_processor_name()
        processor: type[BaseProcessor] = getattr(container, processor_name, None)
        if not processor:
            raise UnknownProcessorError(f"Processor with name {processor_name} not found for task {task.type}")

        task_dto = task_cls(**task.payload, start_at=task.start_at)
        await processor().process_task(task_dto)

    def stop(self):
        logger.info(f"Stopping consumer...")
        self._stop_event.set()
