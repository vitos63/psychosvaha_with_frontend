from fastapi import APIRouter, Depends

from service.client_request import ClientRequestService
from .create import CreateClientRequest, CreateClientResponse
from ...di import client_request_service

router = APIRouter(tags=["client-requests"])


@router.post("/client-request", response_model=CreateClientResponse)
async def create(
    request: CreateClientRequest,
    service: ClientRequestService = Depends(client_request_service),
):
    request = await service.create_client_request(request)
    return CreateClientResponse(request_id=request.id, error=None)
