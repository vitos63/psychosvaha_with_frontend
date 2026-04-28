from typing import Annotated
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

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


@router.get('/therapist/by-tg-id/{tg_id}', response_model=UpdateTherapistResponse)
async def get_user(tg_id: int,
                   service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.get_therapist_by_tg_id(tg_id)
    if therapist is None:
        raise HTTPException(status_code=404, detail="Therapist not found")
    return UpdateTherapistResponse.model_validate(therapist)


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
