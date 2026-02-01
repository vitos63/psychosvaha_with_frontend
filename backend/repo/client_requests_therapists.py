from sqlalchemy.ext.asyncio import AsyncSession

from database.models import ClientRequestTherapist


class ClientRequestTherapistRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_request_therapist(self, request_id: int,
                                       therapist_tg_id: int,
                                       percentage_of_compliance: float) -> ClientRequestTherapist:
        request_therapist = ClientRequestTherapist(
            request_id=request_id,
            therapist_tg_id=therapist_tg_id,
            percentage_of_compliance=percentage_of_compliance
        )
        self._session.add(request_therapist)
        await self._session.flush()
        return request_therapist
