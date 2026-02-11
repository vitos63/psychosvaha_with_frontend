from datetime import UTC

from dependency_injector import containers, providers
from sqlalchemy.ext.asyncio import AsyncSession

from cron.queue.tasks.add_tags_to_client_request.processor import AddTagsToRequestProcessor
from cron.queue.tasks.add_therapists_to_client_request.processor import AddTherapistsToRequestProcessor
from repo.client_requests import ClientRequestRepo
from repo.client_requests_therapists import ClientRequestTherapistRepo
from repo.client_requests_tags import ClientRequestTagRepo
from repo.queue import QueueRepo
from repo.tags import TagRepo
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo
from service.client_request import ClientRequestService
from service.therapist import TherapistService
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

    therapist_repo = providers.Factory(
        TherapistRepo,
        session=session
    )

    therapist_tag_repo = providers.Factory(
        TherapistTagRepo,
        session=session
    )

    client_request_therapist_repo = providers.Factory(
        ClientRequestTherapistRepo,
        session=session
    )

    # Service
    date_time_service = providers.Singleton(
        DateTimeService,
        UTC,
    )

    therapist_service = providers.Factory(
        TherapistService,
        session=session,
        therapist_repo=therapist_repo,
        therapist_tags_repo=therapist_tag_repo,
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
        queue_repo=queue_repo,
        date_time_service=date_time_service
    )

    add_therapists_to_client_request_processor = providers.Factory(
        AddTherapistsToRequestProcessor,
        session=session,
        therapist_repo=therapist_repo,
        therapist_tag_repo=therapist_tag_repo,
        client_request_therapist_repo=client_request_therapist_repo,
        tag_repo=tag_repo,
        client_request_repo=client_request_repo
    )
