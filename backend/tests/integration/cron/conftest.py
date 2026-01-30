import pytest

from cron.queue.tasks.add_tags_to_client_request.processor import AddTagsToRequestProcessor
from modules.di.container import Container


@pytest.fixture
def add_tags_to_request_processor(container: Container) -> AddTagsToRequestProcessor:
    return container.add_tags_to_client_request_processor()
