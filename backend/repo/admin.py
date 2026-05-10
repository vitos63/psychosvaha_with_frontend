from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Admin
from dto.admin import Admin as AdminDTO


class AdminRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_admin(self, dto: AdminDTO) -> Admin:
        admin = Admin(
            tg_id=dto.tg_id,
            username=dto.username,
            password=dto.password
        )
        self._session.add(admin)
        await self._session.flush()
        return admin

    async def select_by_tg_id(self, tg_id: int) -> Admin | None:
        stmt = (select(Admin).
                where(Admin.tg_id == tg_id)
                )
        admin = await self._session.execute(stmt)
        return admin.scalar_one_or_none()

    async def get_admin_tg_id(self) -> int | None:
        stmt = select(Admin.tg_id)
        admin = await self._session.execute(stmt)
        return admin.scalar_one_or_none()
