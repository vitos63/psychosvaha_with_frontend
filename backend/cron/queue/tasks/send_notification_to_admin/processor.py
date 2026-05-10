
from sqlalchemy.ext.asyncio import AsyncSession
from aiogram import Bot

from cron.queue.tasks.base_processor import BaseProcessor
from repo.admin import AdminRepo
from domain.errors import AdminDoesNotExistError
from .task import SendNotificationTOAdminTask
from service.admin import AdminService
from bot.messages import NOTIFICATION_FOR_ADMIN_MESSAGE
from bot.keyboards.admin_keyboard import admin_keyboard


class SendNotificationTOAdminProcessor(BaseProcessor):
    def __init__(
            self,
            session: AsyncSession,
            admin_repo: AdminRepo,
            admin_service: AdminService,
            bot: Bot
    ):
        self._session = session
        self._admin_repo = admin_repo
        self._admin_service = admin_service
        self._bot = bot

    async def process_task(self, task: SendNotificationTOAdminTask):
        not_approved_requests = await self._admin_service.get_main_info_for_admin()
        admin_tg_id = await self._admin_repo.get_admin_tg_id()
        if not admin_tg_id:
            raise AdminDoesNotExistError("Admin not found in database")

        await self._bot.send_message(
            chat_id=admin_tg_id,
            text=NOTIFICATION_FOR_ADMIN_MESSAGE.format(
                not_approved_client_requests=len(
                    not_approved_requests.not_approved_client_requests
                ),
                not_approved_therapists=len(
                    not_approved_requests.not_approved_therapists
                ),
            ),
            reply_markup=admin_keyboard
        )
        
