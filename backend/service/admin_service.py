from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Admin
from dto.admin import Admin as AdminDTO
from repo.admin import AdminRepo


class AdminService:
    def __init__(
            self,
            session: AsyncSession,
            admin_repo: AdminRepo,
    ):
        self._session = session
        self._admin_repo = admin_repo

    async def create_admin(self, admin: AdminDTO) -> Admin:
        try:
            admin = await self._admin_repo.create_admin(admin)
            await self._session.commit()
            return admin
        except Exception:
            await self._session.rollback()
            raise

    async def __get_admin_by_tg_id(self, tg_id: int) -> Admin | None:
        admin = await self._admin_repo.select_by_tg_id(tg_id=tg_id)
        return admin

    async def check_is_admin(self, tg_id: int) -> bool:
        admin = await self.__get_admin_by_tg_id(tg_id=tg_id)

        if admin:
            return True

        return False
