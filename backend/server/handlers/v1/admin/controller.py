from typing import Annotated
from fastapi.routing import APIRouter
from fastapi import Depends, HTTPException

from backend.service.admin import AdminService
from server.dependencies import admin_service
from main_info.response import MainInfoForAdminResponse


admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/main-info")
async def get_main_info(service: Annotated[AdminService, Depends(admin_service)], tg_id: int):
    is_admin = await service.check_is_admin(tg_id=tg_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await service.get_main_info_for_admin()
    return MainInfoForAdminResponse.model_validate(result)
