
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from aiogram import Bot

from cron.queue.tasks.base_processor import BaseProcessor
from repo.client_requests import ClientRequestRepo
from repo.queue import QueueRepo
from service.date_time import DateTimeService
from ..add_therapists_to_client_request.task import AddTherapistsToRequestTask
from config import ADMIN_TG_CHAT_ID

from .task import RemoveFrozenRequestsTask


class RemoveFrozenRequestsProcessor(BaseProcessor):
    def __init__(
            self,
            bot: Bot,
            session: AsyncSession,
            queue_repo: QueueRepo,
            date_time_service: DateTimeService,
            client_request_repo: ClientRequestRepo,
    ):
        self._bot = bot
        self._session = session
        self._queue_repo = queue_repo
        self._date_time_service = date_time_service
        self._client_request_repo = client_request_repo

    async def process_task(self, task: RemoveFrozenRequestsTask):
        frozen_requests = await self._client_request_repo.get_frozen_requests()
        if not frozen_requests:
            return

        for request in frozen_requests:
            logger.warning(f"Remove frozen request: {request.id}")
            try:
                task = AddTherapistsToRequestTask(
                    request_id=request.id,
                )
                await self._queue_repo.create_task(
                    task=task,
                    start_at=self._date_time_service.get_current_time(),
                )
                await self._session.commit()
                await self._bot.send_message(chat_id=ADMIN_TG_CHAT_ID, text=f"Была удалена зависшая заявка {request.id}")

            except Exception:
                await self._session.rollback()
                await self._bot.send_message(chat_id=ADMIN_TG_CHAT_ID, text=f"Ошибка во время удаления зависшей заявки {request.id}")
