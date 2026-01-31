from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Therapist
from dto.therapist import CreateTherapist, UpdateTherapist
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo


class TherapistService:
    def __init__(
            self,
            session: AsyncSession,
            therapist_repo: TherapistRepo,
            therapist_tags_repo: TherapistTagRepo,
    ):
        self._session = session
        self._therapist_repo = therapist_repo
        self._therapist_tags_repo = therapist_tags_repo

    async def create_therapist(self, therapist_dto: CreateTherapist) -> Therapist:
        try:
            therapist = await self._therapist_repo.create_therapist(therapist_dto)
            await self._therapist_tags_repo.create_therapist_tags(therapist_tg_id=therapist.tg_id,
                                                                  tag_ids=therapist_dto.tag_ids)
            await self._session.commit()
            return therapist
        except Exception:
            await self._session.rollback()
            raise

    async def update_therapist(self, therapist_tg_id: int, therapist_dto: UpdateTherapist) -> Therapist:
        try:
            therapist = await self._therapist_repo.update_therapist(therapist_tg_id=therapist_tg_id, 
                                                                    therapist_dto=therapist_dto)
            await self._therapist_tags_repo.update_therapist_tags(therapist_tg_id=therapist.tg_id,
                                                                  tag_ids=therapist_dto.tag_ids)
            await self._session.commit()
            return therapist
        except Exception:
            await self._session.rollback()
            raise
