
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.base_processor import BaseProcessor
from domain.errors import ClientRequestDoesNotExistError
from domain.request_therapists import ClientTherapistsDomain
from repo.client_requests_therapists import ClientRequestTherapistRepo
from repo.client_requests import ClientRequestRepo
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo
from repo.tags import TagRepo

from .task import AddTherapistsToRequestTask


class AddTherapistsToRequestProcessor(BaseProcessor):
    def __init__(
            self,
            session: AsyncSession,
            therapist_repo: TherapistRepo,
            client_request_therapist_repo: ClientRequestTherapistRepo,
            therapist_tag_repo: TherapistTagRepo,
            client_request_repo: ClientRequestRepo,
            tag_repo: TagRepo
    ):
        self._session = session
        self._therpist_tag_repo = therapist_tag_repo
        self._client_request_therapist_repo = client_request_therapist_repo
        self._tag_repo = tag_repo
        self._therapist_repo = therapist_repo
        self._client_request_repo = client_request_repo

    async def process_task(self, task: AddTherapistsToRequestTask):
        client_request = await self._client_request_repo.select_by_request_id(task.request_id)
        if not client_request:
            raise ClientRequestDoesNotExistError(f"{task.request_id=} not found in database")

        request_therapists = await self._client_request_therapist_repo.get_therapists_with_rank_by_request(client_request_id=task.request_id)

        try:
            for therapist, percentage_of_compliance in request_therapists:
                logger.debug(f"Applying therapist {therapist.tg_id} to request_id={task.request_id}")
                await self._client_request_therapist_repo.create_request_therapist(request_id=task.request_id,
                                                                                   therapist_tg_id=therapist.tg_id,
                                                                                   percentage_of_compliance=percentage_of_compliance)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
