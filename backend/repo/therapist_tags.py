from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database.models import TherapistTag, Tag


class TherapistTagRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_therapist_tags(self, therapist_tg_id: int, tag_ids: list[int]) -> list[TherapistTag]:
        therapist_tags = []
        for tag_id in tag_ids:
            therapist_tag = TherapistTag(
                therapist_tg_id=therapist_tg_id,
                tag_id=tag_id,
            )
            self._session.add(therapist_tag)
            therapist_tags.append(therapist_tag)
        await self._session.flush()
        return therapist_tags

    async def update_therapist_tags(self, therapist_tg_id: int, tag_ids: list[int]) -> list[TherapistTag]:
        stmt = delete(TherapistTag).where(TherapistTag.therapist_id==therapist_tg_id)
        await self._session.execute(stmt)
        return await self.create_therapist_tags(therapist_tg_id=therapist_tg_id, tag_ids=tag_ids)

    async def get_therapist_tags(self, therapist_tg_id: int) -> list[Tag]:
        stmt = (
            select(Tag)
            .join(TherapistTag, Tag.id == TherapistTag.tag_id)
            .where(TherapistTag.therapist_id == therapist_tg_id)
            )
        result = await self._session.execute(stmt)
        return result.scalars().all()
