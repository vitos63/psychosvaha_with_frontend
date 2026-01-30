import pytest
from httpx import AsyncClient

from cron.queue.tasks.add_tags_to_client_request.processor import AddTagsToRequestProcessor
from cron.queue.tasks.add_tags_to_client_request.task import AddTagsToRequestTask
from dto.client_request import CreateClientRequest
from repo.client_requests_tags import ClientRequestTagRepo
from server.handlers.v1.client_requests.create import CreateClientResponse
from tests.utils.factories.request_factories import build_create_client_request


@pytest.mark.anyio
@pytest.mark.parametrize("request_body, exp_tag_titles", [
    pytest.param(
        build_create_client_request(
            problem_description="Я очень хочу совершить самоубийство!"
        ),
        ["селфхарм/суицид",],
        id="сицид",
    ),
])
async def test_process_task(
        request_body: CreateClientRequest,
        exp_tag_titles: list[str],

        client: AsyncClient,
        add_tags_to_request_processor: AddTagsToRequestProcessor,
        client_request_tag_repo: ClientRequestTagRepo,
):
    response = await client.post("/v1/client-request", json=request_body.model_dump(exclude_none=True))
    assert response.status_code == 200

    response_body = CreateClientResponse(**response.json())
    assert response_body.request_id

    task = AddTagsToRequestTask(request_id=response_body.request_id)
    await add_tags_to_request_processor.process_task(task)

    actual_tags = await client_request_tag_repo.select_by_request_id(response_body.request_id)
    actual_tag_titles = [t.tag.title for t in actual_tags]
    assert actual_tag_titles == exp_tag_titles
