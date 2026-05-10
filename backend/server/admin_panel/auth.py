from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from typing import Annotated
from fastapi import Depends

from server.dependencies import admin_service
from service.admin import AdminService


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request, service: Annotated[AdminService, Depends(admin_service)]) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        is_authenticated = await service.check_admin_creditionals(username=username, password=password)
        if is_authenticated:
            request.session.update({"token": "ok"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request):
        return request.session.get("token")
