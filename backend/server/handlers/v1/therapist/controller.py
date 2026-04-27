from typing import Annotated
from fastapi import APIRouter, Depends, File, UploadFile

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
    file: UploadFile|None = File(None),
):
    therapist = await service.create_therapist(therapist, file)
    await remove_start_keyboard_for_user(bot=bot, user_id=therapist.tg_id)
    return CreateTherapistResponse.model_validate(therapist)


@router.put("/therapist/{tg_id}", response_model=UpdateTherapistResponse)
async def update(
    tg_id: int,
    therapist: Annotated[UpdateTherapistRequest, Depends(UpdateTherapistRequest.as_form)],
    service: Annotated[TherapistService, Depends(therapist_service)],
    file: UploadFile | None = File(None),

):
    therapist = await service.update_therapist(therapist_tg_id=tg_id, therapist_dto=therapist, file=file)
    await remove_start_keyboard_for_user(bot=bot, user_id=tg_id)
    return UpdateTherapistResponse.model_validate(therapist)
