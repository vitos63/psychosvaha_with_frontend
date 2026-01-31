from typing import Annotated
from fastapi import APIRouter, Depends

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
    return CreateTherapistResponse.model_validate(therapist)


@router.put("/therapist/{therapist_tg_id}", response_model=UpdateTherapistResponse)
async def update(
    therapist: UpdateTherapistRequest,
    therapist_tg_id: int,
    service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.update_therapist(therapist_tg_id=therapist_tg_id, therapist_dto=therapist)
    return UpdateTherapistResponse.model_validate(therapist)
