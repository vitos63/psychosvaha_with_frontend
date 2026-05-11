from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from server.dependencies import admin_service, container, db_session


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        
        container_ = await container(session=await db_session())
        service = await admin_service(container_)

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
