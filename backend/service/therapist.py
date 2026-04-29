from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Therapist
from dto.therapist import CreateTherapist, UpdateTherapist
from repo.therapists import TherapistRepo
from repo.therapist_tags import TherapistTagRepo
from service.file_service import FileService


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

    async def create_therapist(self, therapist_dto: CreateTherapist) -> Therapist:
        try:
            therapist = await self._therapist_repo.create_therapist(therapist_dto)
            await self._session.commit()
            return therapist
        except Exception:
            await self._session.rollback()
            raise

    async def update_therapist(self, therapist_tg_id: int, therapist_dto: UpdateTherapist, file: UploadFile|None) -> Therapist:
        new_path: str | None = None
        try:
            old_therapist = await self.get_therapist_by_tg_id(therapist_tg_id)

            if file is not None:
                path = await self._file_serv.upload_avatar(file)
                new_path = path
            else:
                path = old_therapist.avatar_path
            therapist = await self._therapist_repo.update_therapist(therapist_tg_id=therapist_tg_id, 
                                                                    therapist_dto=therapist_dto,
                                                                    path_photo=path)
            await self._therapist_tags_repo.update_therapist_tags(therapist_tg_id=therapist.tg_id,
                                                                  tag_ids=therapist_dto.tag_ids)
            await self._session.commit()

            if file is not None:
                await self._file_serv.delete_photo(old_therapist.avatar_path)

            return therapist
        except Exception:
            await self._session.rollback()

            if new_path is not None:
                await self._file_serv.delete_photo(new_path)

            raise

    async def get_therapist_by_tg_id(self, therapist_tg_id: int) -> Therapist | None:
        therapist = await self._therapist_repo.select_by_tg_id(tg_id=therapist_tg_id)
        return therapist

    async def get_tag_ids_by_tg_id(self, therapist_tg_id: int) -> list[int]:
        tags = await self._therapist_tags_repo.get_therapist_tags(
        therapist_tg_id=therapist_tg_id
    )
        tag_ids = [tag.id for tag in tags]
        return tag_ids
