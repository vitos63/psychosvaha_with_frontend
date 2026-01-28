from typing import Annotated

from fastapi import APIRouter, Depends

from server.dependencies import client_request_service
from service.client_request import ClientRequestService

from .create import CreateClientRequest, CreateClientResponse

router = APIRouter(prefix="/v1", tags=["client-requests"])


@router.post("/client-request", response_model=CreateClientResponse)
async def create(
    request: CreateClientRequest,
    service: Annotated[ClientRequestService, Depends(client_request_service)],
):
    request = await service.create_client_request(request)
    return CreateClientResponse(request_id=request.id)
