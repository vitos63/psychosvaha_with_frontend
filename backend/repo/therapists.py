from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Therapist
from dto.therapist import CreateTherapist, UpdateTherapist


class TherapistRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_therapist(self, dto: CreateTherapist) -> Therapist:
        therapist = Therapist(
            first_name=dto.first_name,
            last_name=dto.last_name,
            city=dto.city,
            phone_number=dto.phone_number,
            email=dto.email,
            photo=dto.photo,
            approved=False,
            consent=dto.consent,
            pitch=dto.pitch,
            site=dto.site,
            sex=dto.sex,
            age=dto.age,
            currency_amount=dto.currency_amount,
            experience=dto.experience,
            count_of_recomendations=0,
            min_client_age=dto.min_client_age,
            max_client_age=dto.max_client_age,
            online=dto.online,
            contacts_for_client=dto.contacts_for_client,
            psychiatrist=dto.psychiatrist,
            group_therapy=dto.group_therapy,
            supervisor=dto.supervisor,
            gerontologist=dto.gerontologist,
            couple_therapist=dto.couple_therapist,
            available_to_call=dto.available_to_call,
        )
        self._session.add(therapist)
        await self._session.flush()
        return therapist

    async def update_therapist(self, therapist_tg_id: int, therapist_dto: UpdateTherapist) -> Therapist:
        update_dict = therapist_dto.model_dump()

        stmt = (update(Therapist)
                .where(
                    Therapist.tg_id == therapist_tg_id
                    )
                .values(
                    **update_dict
                )
                .returning(Therapist))
        result = await self._session.execute(stmt)
        await self._session.flush()
        therapist = result.scalar_one()
        return therapist

    async def select_by_tg_id(self, tg_id: int) -> Therapist | None:
        stmt = (
            select(Therapist)
            .where(
                Therapist.tg_id == tg_id,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalars().first()
