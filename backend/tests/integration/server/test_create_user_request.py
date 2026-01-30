import pytest
from httpx import AsyncClient

from dto.enums import Sex
from repo.client_requests import ClientRequestRepo
from server.handlers.v1.client_requests.create.request import CreateClientRequest
from server.handlers.v1.client_requests.create.response import CreateClientResponse
from tests.utils.factories.request_factories import build_create_client_request


@pytest.mark.anyio
@pytest.mark.parametrize("request_body", [
    pytest.param(build_create_client_request(), id="No optional fields"),
    pytest.param(
        build_create_client_request(
            currency_amount={"USD": 1000, "RUB": 10000},
            city="Tbilisi",
            psychotherapist_sex=Sex.female,
            need_psychiatrist=True,
        ),
        id="All fields",
    ),
])
async def test_v1_create_user_request_positive(
        request_body: CreateClientRequest,

        client: AsyncClient,
        client_request_repo: ClientRequestRepo,
):
    response = await client.post("/v1/client-request", json=request_body.model_dump(exclude_none=True))
    assert response.status_code == 200

    response_body = CreateClientResponse(**response.json())
    assert response_body.request_id

    created_request = await client_request_repo.select_by_request_id(response_body.request_id)
    assert created_request
