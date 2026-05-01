from sqlalchemy.ext.asyncio import AsyncSession

from service.date_time import DateTimeService
from database.models import Admin
from dto.admin import Admin as AdminDTO, MainInfoForAdmin
from dto.client_request import ClientRequestForAdmin
from dto.therapist import TherapistForAdmin
from repo.admin import AdminRepo
from repo.queue import QueueRepo
from repo.therapists import TherapistRepo
from repo.client_requests import ClientRequestRepo
from cron.queue.tasks.add_therapists_to_client_request.task import AddTherapistsToRequestTask


class AdminService:
    def __init__(
            self,
            session: AsyncSession,
            admin_repo: AdminRepo,
            therapist_repo: TherapistRepo,
            client_request_repo: ClientRequestRepo,
            queue_repo: QueueRepo,
            date_time_service: DateTimeService
    ):
        self._session = session
        self._admin_repo = admin_repo
        self._therapist_repo = therapist_repo
        self._client_request_repo = client_request_repo
        self._queue_repo = queue_repo
        self._date_time_service = date_time_service

    async def create_admin(self, admin: AdminDTO) -> Admin:
        try:
            admin = await self._admin_repo.create_admin(admin)
            await self._session.commit()
            return admin
        except Exception:
            await self._session.rollback()
            raise

    async def __get_admin_by_tg_id(self, tg_id: int) -> Admin | None:
        admin = await self._admin_repo.select_by_tg_id(tg_id=tg_id)
        return admin

    async def check_is_admin(self, tg_id: int) -> bool:
        admin = await self.__get_admin_by_tg_id(tg_id=tg_id)

        if admin:
            return True
        return False

    async def get_main_info_for_admin(self) -> MainInfoForAdmin:
        not_approved_client_requests = await self._client_request_repo.get_not_approved_client_requests()
        not_approved_therapists = await self._therapist_repo.get_not_approved_therapists()
        not_approved_client_requests = [ClientRequestForAdmin.model_validate(request) for request in not_approved_client_requests]
        not_approved_therapists = [TherapistForAdmin.model_validate(therapist) for therapist in not_approved_therapists]
        return MainInfoForAdmin(
            not_approved_client_requests=not_approved_client_requests,
            not_approved_therapists=not_approved_therapists
        )

    async def approve_client_request(self, client_request: ClientRequestForAdmin):
        try:
            await self._client_request_repo.approve_client_request(client_request.id)
            await self._session.commit()
            task = AddTherapistsToRequestTask(
                request_id=client_request.id,
            )
            await self._queue_repo.create_task(
                task=task,
                start_at=self._date_time_service.get_current_time(),
            )

        except Exception:
            await self._session.rollback()
            raise

    async def approve_therapist(self, therapist: TherapistForAdmin):
        try:
            await self._therapist_repo.approve_therapist(therapist.tg_id)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
