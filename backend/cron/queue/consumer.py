import asyncio
from collections.abc import Callable

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from config import (
    CONSUMER_BATCH_SIZE,
    CONSUMER_SHUTDOWN_SECONDS,
    CONSUMER_SLEEP_SECONDS,
)
from cron.queue.errors import UnknownProcessorError, UnknownTaskError
from cron.queue.tasks.add_tags_to_client_request.task import AddTagsToRequestTask
from cron.queue.tasks.add_therapists_to_client_request.task import AddTherapistsToRequestTask
from cron.queue.tasks.base_processor import BaseProcessor
from cron.queue.tasks.base_task import BaseTask
from dto.enums import QueueStatus
from modules.di.container import Container


class QueueConsumer:
    def __init__(
            self,
            session_factory: Callable[..., AsyncSession],
            container_factory: Callable[..., Container],
            batch_size: int = CONSUMER_BATCH_SIZE,
            sleep_seconds: float = CONSUMER_SLEEP_SECONDS,
            shutdown_seconds: float = CONSUMER_SHUTDOWN_SECONDS,
    ):
        self._session_factory = session_factory
        self._container_factory = container_factory
        self._batch_size = batch_size
        self._sleep_seconds = sleep_seconds
        self._type_to_task_cls: dict[str, type[BaseTask]] = {
            AddTagsToRequestTask.get_type(): AddTagsToRequestTask,
            AddTherapistsToRequestTask.get_type(): AddTherapistsToRequestTask
        }
        self._shutdown_seconds = shutdown_seconds
        self._is_running = True

    async def run(self):
        logger.info("Consumer started")

        while self._is_running:
            poll_task = asyncio.create_task(self._handle_poll())

            try:
                await asyncio.shield(poll_task)
            except asyncio.CancelledError:
                logger.info("Stopping consumer...")
                self._is_running = False
                await asyncio.wait_for(poll_task, timeout=self._shutdown_seconds)
            except Exception as e:
                logger.error(f"Consumer error: {e}")

        logger.info("Consumer stopped")

    async def _handle_poll(self):
        async with self._session_factory() as session:
            container = self._container_factory(session=session)
            queue_repo = container.queue_repo()
            date_time_service = container.date_time_service()

            ready_tasks = await queue_repo.select_ready(
                start_at=date_time_service.get_current_time(),
                limit=self._batch_size,
            )

            if not ready_tasks:
                await asyncio.sleep(self._sleep_seconds)
                return

            for task in ready_tasks:
                try:
                    await self._handle_task(task.id, task.type, task.payload)
                except Exception:
                    logger.exception(f"Failed to process task: task.id={task.id}")
                    task.status = QueueStatus.ERROR
                else:
                    task.status = QueueStatus.DONE
                finally:
                    task.finished_at = date_time_service.get_current_time()
                    await session.commit()

    async def _handle_task(self, task_id: int, task_type: str, payload: dict):
        logger.debug(f"Processing task: {task_id=} {task_type=}")

        async with self._session_factory() as session:
            container = self._container_factory(session=session)

            task_cls = self._type_to_task_cls.get(task_type)
            if not task_cls:
                raise UnknownTaskError(f"Unknown task type: {task_type}")

            processor_name = task_cls.get_processor_name()
            processor: type[BaseProcessor] = getattr(container, processor_name, None)
            if not processor:
                raise UnknownProcessorError(f"Processor with name {processor_name} not found for task {task_type}")

            task_dto = task_cls(**payload)
            await processor().process_task(task_dto)

        logger.debug(f"Finished task: {task_id=} {task_type=}")
