from sqlalchemy.ext.asyncio import AsyncSession
from aiogram import Bot

from bot.services.start_keyboard import remove_start_keyboard_for_user
from bot.storage.start_messages import set_start_message_id
from service.date_time import DateTimeService
from database.models import Admin
from dto.admin import Admin as AdminDTO, MainInfoForAdmin
from dto.client_request import ClientRequestForAdmin
from dto.therapist import TherapistForAdmin
from server.handlers.v1.admin.request import DisapproveTherapistRequest
from repo.admin import AdminRepo
from repo.queue import QueueRepo
from repo.client_requests_tags import ClientRequestTagRepo
from repo.therapists import TherapistRepo
from repo.client_requests import ClientRequestRepo
from cron.queue.tasks.add_therapists_to_client_request.task import AddTherapistsToRequestTask
from bot.messages import NOTIFICATION_FOR_THERAPIST_WERE_APPROVED, NOTIFICATION_FOR_THERAPIST_WERE_DISAPPROVED
from bot.keyboards.therapist_keyboards import therapist_second_form_keyboard
from bot.keyboards.start_keyboard import get_start_keyboard


class AdminService:
    def __init__(
            self,
            session: AsyncSession,
            admin_repo: AdminRepo,
            therapist_repo: TherapistRepo,
            client_request_repo: ClientRequestRepo,
            client_request_tag_repo: ClientRequestTagRepo,
            queue_repo: QueueRepo,
            date_time_service: DateTimeService,
            bot: Bot
    ):
        self._session = session
        self._admin_repo = admin_repo
        self._therapist_repo = therapist_repo
        self._client_request_repo = client_request_repo
        self._client_request_tag_repo = client_request_tag_repo
        self._queue_repo = queue_repo
        self._date_time_service = date_time_service
        self._bot = bot

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

    async def check_admin_creditionals(self, username: str, password: str) -> bool:
        admin = await self._admin_repo.select_by_username(username=username)
        if not admin:
            return False
        return admin.verify_password(password)

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
            await self._client_request_tag_repo.update_request_tags(request_id=client_request.id, tags=client_request.tags)
            await self._session.commit()
            task = AddTherapistsToRequestTask(
                request_id=client_request.id,
            )
            await self._queue_repo.create_task(
                task=task,
                start_at=self._date_time_service.get_current_time(),
            )
            await self._session.commit()
            await self.__remove_admin_keyboard()

        except Exception:
            await self._session.rollback()
            raise

    async def approve_therapist(self, therapist: TherapistForAdmin):
        try:
            await self._therapist_repo.approve_therapist(therapist.tg_id)
            await self._session.commit()
            
            message = await self._bot.send_message(
                chat_id=therapist.tg_id,
                text=NOTIFICATION_FOR_THERAPIST_WERE_APPROVED,
                reply_markup=therapist_second_form_keyboard
            )

            await self.__remove_admin_keyboard()
            await set_start_message_id(chat_id=therapist.tg_id,
                                       user_id=therapist.tg_id,
                                       message_id=message.message_id)

        except Exception:
            await self._session.rollback()
            raise

    async def disapprove_therapist(self, therapist: DisapproveTherapistRequest):
        try:
            await self._therapist_repo.disapprove_therapist(therapist.tg_id)
            await self._session.commit()
            
            message = await self._bot.send_message(
                chat_id=therapist.tg_id,
                text=NOTIFICATION_FOR_THERAPIST_WERE_DISAPPROVED,
                reply_markup=get_start_keyboard
            )

            await self.__remove_admin_keyboard()
            await set_start_message_id(chat_id=therapist.tg_id,
                                        user_id=therapist.tg_id,
                                        message_id=message.message_id)

        except Exception:
            await self._session.rollback()
            raise
    
    async def __remove_admin_keyboard(self):
        admin_tg_id = await self._admin_repo.get_admin_tg_id()
        await remove_start_keyboard_for_user(self._bot, user_id=admin_tg_id)
