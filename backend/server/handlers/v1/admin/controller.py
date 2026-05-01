from typing import Annotated
from fastapi.routing import APIRouter
from fastapi import Depends, HTTPException, status

from backend.service.admin import AdminService
from server.dependencies import admin_service
from response import MainInfoForAdminResponse
from request import ApproveClientRequestRequest, ApproveTherapistRequest


admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/main-info", response_model=MainInfoForAdminResponse)
async def get_main_info(service: Annotated[AdminService, Depends(admin_service)], tg_id: int):
    is_admin = await service.check_is_admin(tg_id=tg_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await service.get_main_info_for_admin()
    return MainInfoForAdminResponse.model_validate(result)


@admin_router.put("/approve-client-request")
async def approve_client_request(service: Annotated[AdminService, Depends(admin_service)], client_request: ApproveClientRequestRequest):
    await service.approve_client_request(client_request)
    return status.HTTP_204_NO_CONTENT


@admin_router.put("/approve-therapist")
async def approve_therapist(service: Annotated[AdminService, Depends(admin_service)], therapist: ApproveTherapistRequest):
    await service.approve_therapist(therapist)
    return status.HTTP_204_NO_CONTENT
