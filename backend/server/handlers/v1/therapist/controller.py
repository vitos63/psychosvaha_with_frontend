from typing import Annotated
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Request

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


@router.get('/therapist/{tg_id}', response_model=UpdateTherapistResponse)
async def get_user(tg_id: int,
                   request: Request,
                   service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.get_therapist_by_tg_id(tg_id)
    if therapist is None:
        raise HTTPException(status_code=404, detail="Therapist not found")
    response = UpdateTherapistResponse.model_validate(therapist)
    response.tag_ids = await service.get_tag_ids_by_tg_id(tg_id)
    response.avatar_url = service.get_avatar_path(therapist, request.base_url)


    return response

@router.put("/therapist/{tg_id}", response_model=UpdateTherapistResponse)
async def update(
    tg_id: int,
    request: Request,
    therapist: Annotated[UpdateTherapistRequest, Depends(UpdateTherapistRequest.as_form)],
    service: Annotated[TherapistService, Depends(therapist_service)],
    file: UploadFile | None = File(None),

):
    therapist = await service.update_therapist(therapist_tg_id=tg_id, therapist_dto=therapist, file=file)
    await remove_start_keyboard_for_user(bot=bot, user_id=tg_id)
    response = UpdateTherapistResponse.model_validate(therapist)
    response.avatar_url = service.get_avatar_path(therapist, request.base_url)

    return response