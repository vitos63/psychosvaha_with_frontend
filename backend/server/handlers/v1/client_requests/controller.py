from typing import Annotated

from fastapi import APIRouter, Depends

from bot.instance import bot
from bot.services.start_keyboard import remove_start_keyboard_for_user
from server.dependencies import client_request_service
from service.client_request import ClientRequestService

from .create import CreateClientRequest, CreateClientResponse

router = APIRouter(prefix="/v1", tags=["client-requests"])


@router.post("/client-request", response_model=CreateClientResponse)
async def create(
    request: CreateClientRequest,
    service: Annotated[ClientRequestService, Depends(client_request_service)],
):
    created_request = await service.create_client_request(request)
    await remove_start_keyboard_for_user(bot=bot, user_id=created_request.client_id)
    return CreateClientResponse(request_id=created_request.id)
