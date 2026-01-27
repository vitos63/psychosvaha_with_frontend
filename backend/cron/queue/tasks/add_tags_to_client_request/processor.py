
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.base_processor import BaseProcessor
from domain.errors import ClientRequestDoesNotExistError
from domain.request_tags import ClientRequestDomain
from repo.client_requests import ClientRequestRepo
from repo.client_requests_tags import ClientRequestTagRepo
from repo.tags import TagRepo

from .task import AddTagsToRequestTask


class AddTagsToRequestProcessor(BaseProcessor):
    def __init__(
            self,
            session: AsyncSession,
            tag_repo: TagRepo,
            client_request_tag_repo: ClientRequestTagRepo,
            client_request_repo: ClientRequestRepo,
    ):
        self._session = session
        self._client_request_tag_repo = client_request_tag_repo
        self._tag_repo = tag_repo
        self._client_request_repo = client_request_repo

    async def process_task(self, task: AddTagsToRequestTask):
        client_request = await self._client_request_repo.select_by_request_id(task.request_id)
        if not client_request:
            raise ClientRequestDoesNotExistError(f"{task.request_id=} not found in database")

        all_tags = await self._tag_repo.select_all()
        client_request_domain = ClientRequestDomain.from_db_request(client_request)
        matched_tags = client_request_domain.get_matching_tags(all_tags)

        try:
            for tag in matched_tags:
                logger.debug(f"Applying tag {tag.id=} {tag.title=} to request_id={task.request_id}")
                await self._client_request_tag_repo.create_request_tag(task.request_id, tag.id)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
