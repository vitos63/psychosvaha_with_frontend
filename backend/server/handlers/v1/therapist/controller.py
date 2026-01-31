from typing import Annotated
from fastapi import APIRouter, Depends

from server.dependencies import therapist_service
from service.therapist import TherapistService

from .create import CreateTherpistRequest, CreateTherapistResponse

router = APIRouter(prefix="/v1", tags=["therapist"])


@router.post("/therapist", response_model=CreateTherapistResponse)
async def create(
    therapist: CreateTherpistRequest,
    service: Annotated[TherapistService, Depends(therapist_service)],
):
    therapist = await service.create_therapist(therapist)
    return CreateTherapistResponse.model_validate(therapist)
