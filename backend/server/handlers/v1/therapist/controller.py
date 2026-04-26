from typing import Annotated
from fastapi import APIRouter, Depends

from bot.instance import bot
from bot.services.start_keyboard import remove_start_keyboard_for_user
from server.dependencies import therapist_service
from service.therapist import TherapistService

from .create import CreateTherapistRequest, CreateTherapistResponse
from .update import UpdateTherapistResponse, UpdateTherapistRequest

router = APIRouter(prefix="/v1", tags=["therapist"])


@router.post("/therapist", response_model=CreateTherapistResponse)
async def create(
    therapist: CreateTherapistRequest,
    service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.create_therapist(therapist)
    await remove_start_keyboard_for_user(bot=bot, user_id=therapist.tg_id)
    return CreateTherapistResponse.model_validate(therapist)


@router.put("/therapist/{tg_id}", response_model=UpdateTherapistResponse)
async def update(
    therapist: UpdateTherapistRequest,
    tg_id: int,
    service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.update_therapist(therapist_tg_id=tg_id, therapist_dto=therapist)
    await remove_start_keyboard_for_user(bot=bot, user_id=tg_id)
    return UpdateTherapistResponse.model_validate(therapist)
