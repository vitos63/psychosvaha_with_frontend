
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from aiogram import Bot

from cron.queue.tasks.base_processor import BaseProcessor
from domain.errors import ClientRequestDoesNotExistError
from repo.client_requests_therapists import ClientRequestTherapistRepo
from repo.client_requests import ClientRequestRepo
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo
from repo.tags import TagRepo
from domain.client_therapist import ClientTherapistDomain
from .task import AddTherapistsToRequestTask
from bot.messages import NOTIFICATION_FOR_THERAPIST_WERE_RECOMENDED, NOTIFICATION_FOR_CLIENT_MESSAGE, NOTIFICATION_FOR_CLIENT_MESSAGE_NO_THERAPISTS
from bot.keyboards import client_keyboard

class AddTherapistsToRequestProcessor(BaseProcessor):
    def __init__(
            self,
            session: AsyncSession,
            therapist_repo: TherapistRepo,
            client_request_therapist_repo: ClientRequestTherapistRepo,
            therapist_tag_repo: TherapistTagRepo,
            client_request_repo: ClientRequestRepo,
            tag_repo: TagRepo,
            bot: Bot
    ):
        self._session = session
        self._bot = bot
        self._therpist_tag_repo = therapist_tag_repo
        self._client_request_therapist_repo = client_request_therapist_repo
        self._tag_repo = tag_repo
        self._therapist_repo = therapist_repo
        self._client_request_repo = client_request_repo
        self._bot = bot
    
    async def __notify_therpist(self, therapist_tg_id: int):
        await self._bot.send_message(chat_id=therapist_tg_id, text=NOTIFICATION_FOR_THERAPIST_WERE_RECOMENDED)


    async def process_task(self, task: AddTherapistsToRequestTask):
        client_request = await self._client_request_repo.select_by_request_id(task.request_id)
        if not client_request:
            raise ClientRequestDoesNotExistError(f"{task.request_id=} not found in database")

        request_therapists_with_tags = await self._client_request_therapist_repo.get_therapists_with_tags_by_request(client_request_id=task.request_id)
        client_request_tags = await self._client_request_repo.select_tags_by_request_id(request_id=task.request_id)
        client_therapist_domain = ClientTherapistDomain(therapists_with_tags=request_therapists_with_tags,
                                                        client_request_tags=client_request_tags)
        best_therapists = client_therapist_domain.get_best_therapists_for_request()

        try:
            for therapist, percentage_of_compliance in best_therapists:
                logger.debug(f"Applying therapist {therapist.tg_id} to request_id={task.request_id}")
                await self._client_request_therapist_repo.create_request_therapist(request_id=task.request_id,
                                                                                   therapist_tg_id=therapist.tg_id,
                                                                                   percentage_of_compliance=percentage_of_compliance)
                await self._therapist_repo.increase_count_of_recomendations(therapist_tg_id=therapist.tg_id)
                await self.__notify_therpist(therapist_tg_id=therapist.tg_id)
            await self._session.commit()
            await self.send_message_client(tg_id=client_request.client_id, therapists_count=len(best_therapists)) # TODO remove tg_id from client_request
                
        except Exception:
            await self._session.rollback()
            raise

    async def send_message_client(
            self,
            tg_id: int,
            therapists_count: int,
    ):
        await self._bot.send_message(
            chat_id=tg_id,
            text=NOTIFICATION_FOR_CLIENT_MESSAGE.format(therapists_count=therapists_count) if therapists_count else NOTIFICATION_FOR_CLIENT_MESSAGE_NO_THERAPISTS,
            reply_markup=client_keyboard if therapists_count else None
        ) # TODO added logic of no therapists for request