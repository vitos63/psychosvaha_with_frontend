from sqlalchemy import (
    func,
    select,
    or_,
    case,
    and_,
    cast,
    desc,
    Integer,
    Select,
    Subquery,
)
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import (
    ClientRequestTherapist,
    Therapist,
    ClientRequest,
    ClientRequestTag,
    Tag,
    TherapistTag,
)
from .enums.tags import Tags as TagsEnum
from constants import RUB_MARKUP, EUR_MARKUP, USD_MARKUP


class ClientRequestTherapistRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_request_therapist(
        self, request_id: int, therapist_tg_id: int, percentage_of_compliance: float
    ) -> ClientRequestTherapist:
        request_therapist = ClientRequestTherapist(
            request_id=request_id,
            therapist_tg_id=therapist_tg_id,
            percentage_of_compliance=percentage_of_compliance,
        )
        self._session.add(request_therapist)
        await self._session.flush()
        return request_therapist

    async def get_therapists_with_rank_by_request(
        self, client_request_id: int
    ) -> list[tuple[Therapist, int]]:
        request = await self._session.get(ClientRequest, client_request_id)
        if not request:
            return []

        request_tags_sq = (
            select(
                ClientRequestTag.tag_id.label("tag_id"),
                Tag.title.label("title"),
                Tag.value.label("weight"),
            )
            .join(Tag, Tag.id == ClientRequestTag.tag_id)
            .where(ClientRequestTag.request_id == client_request_id)
            .subquery()
        )

        max_rank_sq = (
            select(func.sum(Tag.value).label("max_rank"))
            .join(ClientRequestTag, Tag.id == ClientRequestTag.tag_id)
            .where(ClientRequestTag.request_id == client_request_id)
            .scalar_subquery()
        )

        stmt = (
            select(
                Therapist,
                cast(
                    func.coalesce(
                        (func.sum(request_tags_sq.c.weight) / max_rank_sq) * 100, 0
                    ).label("rank"),
                    Integer,
                ),
            )
            .outerjoin(
                TherapistTag,
                Therapist.tg_id == TherapistTag.therapist_id,
            )
            .outerjoin(
                request_tags_sq,
                TherapistTag.tag_id == request_tags_sq.c.tag_id,
            )
            .group_by(Therapist.tg_id)
            .order_by(desc("rank"))
            .limit(3)
        )

        stmt = self.__add_terrifory_filters(stmt=stmt, request=request)

        stmt = stmt.where(
            and_(
                Therapist.min_client_age <= request.age,
                Therapist.max_client_age >= request.age,
            )
        )

        if request.psychotherapist_sex:
            stmt = stmt.where(Therapist.sex == request.psychotherapist_sex)

        stmt = self.__add_currency_filters(stmt=stmt, request=request)

        having_conditions = self.__add_tag_conditions(request_tags_sq=request_tags_sq)

        stmt = stmt.having(and_(*having_conditions))

        result = await self._session.execute(stmt)

        return result.all()

    def __add_currency_filters(self, stmt: Select, request: ClientRequest) -> Select:
        if request.currency_amount.get("RUB"):
            rub_price = cast(Therapist.currency_amount["RUB"].as_string(), Integer)
            stmt = stmt.where(
                rub_price - RUB_MARKUP <= request.currency_amount.get("RUB")
            )

        if request.currency_amount.get("USD"):
            usd_price = cast(Therapist.currency_amount["USD"].as_string(), Integer)
            stmt = stmt.where(
                usd_price - USD_MARKUP <= request.currency_amount.get("USD")
            )

        if request.currency_amount.get("EUR"):
            eur_price = cast(Therapist.currency_amount["EUR"].as_string(), Integer)
            stmt = stmt.where(
                eur_price - EUR_MARKUP <= request.currency_amount.get("EUR")
            )

        return stmt

    def __add_tag_conditions(self, request_tags_sq: Subquery) -> list:
        REQUIRED_TAGS = [
            TagsEnum.PSYCHIATRIST.value,
            TagsEnum.FAMILY_THERAPY.value,
            TagsEnum.SUPERVISOR.value,
        ]

        FORBIDDEN_TAGS = {
            TagsEnum.PSYCHIATRIST_NOT_NEEDED.value: TagsEnum.PSYCHIATRIST.value,
        }

        having_conditions = []

        for tag_title in REQUIRED_TAGS:
            having_conditions.append(
                or_(
                    # у заявки НЕТ этого тега
                    func.count(case((request_tags_sq.c.title == tag_title, 1))) == 0,
                    # у терапевта ЕСТЬ этот тег
                    func.count(
                        case(
                            (
                                and_(
                                    request_tags_sq.c.title == tag_title,
                                    TherapistTag.tag_id == request_tags_sq.c.tag_id,
                                ),
                                1,
                            )
                        )
                    )
                    > 0,
                )
            )

        for client_tag, forbidden_therapist_tag in FORBIDDEN_TAGS.items():
            having_conditions.append(
                or_(
                    # у клиента НЕТ client_tag
                    func.count(case((request_tags_sq.c.title == client_tag, 1))) == 0,
                    # у терапевта НЕТ forbidden_therapist_tag
                    func.count(
                        case(
                            (
                                and_(
                                    request_tags_sq.c.title == forbidden_therapist_tag,
                                    TherapistTag.tag_id == request_tags_sq.c.tag_id,
                                ),
                                1,
                            )
                        )
                    )
                    == 0,
                )
            )

        return having_conditions

    def __add_terrifory_filters(self, stmt: Select, request: ClientRequest) -> Select:
        if request.city and request.is_online:
            stmt = stmt.where(or_(Therapist.city == request.city, Therapist.online))

        elif request.is_online:
            stmt = stmt.where(Therapist.online.is_(True))

        elif request.city:
            stmt = stmt.where(Therapist.city == request.city)

        return stmt
