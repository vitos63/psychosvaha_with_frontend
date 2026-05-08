from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.add_tags_to_client_request.task import AddTagsToRequestTask
from cron.queue.tasks.send_notification_to_admin.task import SendNotificationTOAdminTask
from database.models import ClientRequest
from dto.client_request import CreateClientRequest
from repo.client_requests import ClientRequestRepo
from repo.queue import QueueRepo
from service.date_time import DateTimeService
from dto.therapist import UpdateTherapist


class ClientRequestService:
    def __init__(
            self,
            session: AsyncSession,
            client_request_repo: ClientRequestRepo,
            queue_repo: QueueRepo,
            date_time_service: DateTimeService,
    ):
        self._session = session
        self._client_request_repo = client_request_repo
        self._queue_repo = queue_repo
        self._date_time_service = date_time_service

    async def create_client_request(self, request: CreateClientRequest) -> ClientRequest:
        try:
            request = await self._client_request_repo.create_request(request)
            task = AddTagsToRequestTask(
                request_id=request.id,
            )
            await self._queue_repo.create_task(
                task=task,
                start_at=self._date_time_service.get_current_time(),
            )
            await self._queue_repo.create_task(
                task=SendNotificationTOAdminTask(),
                start_at=self._date_time_service.get_current_time(),
            )
            await self._session.commit()
            return request
        except Exception:
            await self._session.rollback()
            raise

    async def get_client_request_by_tg_id(self, tg_id: int) -> ClientRequest | None:
        client_request = await self._client_request_repo.select_by_tg_id(tg_id=tg_id)
        return client_request

    async def get_therapists_by_tg_id(self, tg_id: int) -> list[UpdateTherapist]:
        request_client = await self._client_request_repo.select_by_tg_id(tg_id=tg_id)
        return await self._client_request_repo.get_therapists_by_id_request(request_id=request_client.id)
