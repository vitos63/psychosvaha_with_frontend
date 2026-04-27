from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Therapist
from dto.therapist import CreateTherapist, UpdateTherapist
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo
from file_service import FileService


class TherapistService:
    def __init__(
            self,
            session: AsyncSession,
            therapist_repo: TherapistRepo,
            therapist_tags_repo: TherapistTagRepo,
            file_serv: FileService
    ):
        self._session = session
        self._therapist_repo = therapist_repo
        self._therapist_tags_repo = therapist_tags_repo
        self._file_serv = file_serv

    async def create_therapist(self, therapist_dto: CreateTherapist, file: UploadFile|None) -> Therapist:
        try:
            db_path = await self._file_serv.upload_avatar(file)
            therapist = await self._therapist_repo.create_therapist(therapist_dto, db_path)
            await self._session.commit()
            return therapist
        except Exception:
            await self._session.rollback()
            raise

    async def update_therapist(self, therapist_tg_id: int, therapist_dto: UpdateTherapist, file: UploadFile|None) -> Therapist:
        try:
            tnera= await self.get_therapist_by_tg_id(therapist_tg_id)
            await self._file_serv.delete_photo(tnera.avatar_path)
            path = await self._file_serv.upload_avatar(file)
            therapist = await self._therapist_repo.update_therapist(therapist_tg_id=therapist_tg_id, 
                                                                    therapist_dto=therapist_dto,
                                                                    path_photo=path)
            await self._therapist_tags_repo.update_therapist_tags(therapist_tg_id=therapist.tg_id,
                                                                  tag_ids=therapist_dto.tag_ids)
            await self._session.commit()
            return therapist
        except Exception:
            await self._session.rollback()
            raise

    async def get_therapist_by_tg_id(self, therapist_tg_id: int) -> Therapist | None:
        therapist = await self._therapist_repo.select_by_tg_id(tg_id=therapist_tg_id)
        return therapist
