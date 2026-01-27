from datetime import UTC

from dependency_injector import containers, providers
from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.add_tags_to_client_request.processor import AddTagsToRequestProcessor
from repo.client_requests import ClientRequestRepo
from repo.client_requests_tags import ClientRequestTagRepo
from repo.queue import QueueRepo
from repo.tags import TagRepo
from service.client_request import ClientRequestService
from service.date_time import DateTimeService


class Container(containers.DeclarativeContainer):
    session = providers.Dependency(instance_of=AsyncSession)

    # Repository
    client_request_repo = providers.Factory(
        ClientRequestRepo,
        session=session,
    )

    client_request_tag_repo = providers.Factory(
        ClientRequestTagRepo,
        session=session,
    )

    queue_repo = providers.Factory(
        QueueRepo,
        session=session,
    )

    tag_repo = providers.Factory(
        TagRepo,
        session=session,
    )

    # Service
    date_time_service = providers.Singleton(
        DateTimeService,
        UTC,
    )

    client_request_service = providers.Factory(
        ClientRequestService,
        session=session,
        client_request_repo=client_request_repo,
        queue_repo=queue_repo,
        date_time_service=date_time_service,
    )

    # Processors
    add_tags_to_client_request_processor = providers.Factory(
        AddTagsToRequestProcessor,
        session=session,
        tag_repo=tag_repo,
        client_request_tag_repo=client_request_tag_repo,
        client_request_repo=client_request_repo,
    )
