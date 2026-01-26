from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.base_processor import BaseProcessor
from repo.client_requests_tags import ClientRequestTagRepo
from .task import AddTagsToRequestTask


class AddTagsToRequestProcessor(BaseProcessor):
    def __init__(
            self,
            session: AsyncSession,
            client_request_tag_repo: ClientRequestTagRepo,
    ):
        self._session = session
        self._client_request_tag_repo = client_request_tag_repo

    async def process_task(self, task: AddTagsToRequestTask):
        # TODO: tags logic
        await self._client_request_tag_repo.create_request_tag(task.request_id, 1)
        await self._session.commit()
