from database.models import ClientRequest, Tag, Therapist
from repo.therapist_tags import TherapistTagRepo
from repo.tags import TagRepo


class ClientTherapistsDomain:
    def __init__(self,
                 request: ClientRequest,
                 tags: list[Tag],
                 therapists: list[Therapist],
                 therapist_tag_repo: TherapistTagRepo,
                 tag_repo: TagRepo):
        self._tags = tags
        self._tags_titles: list[str] = [tag.title for tag in tags]
        self._currency = request.currency_amount
        self._age = request.age
        self._psychotherapist_sex = request.psychotherapist_sex
        self._is_online = request.is_online
        self._city = request.city
        self._therapists = set(therapists)
        self._therapist_tag_repo = therapist_tag_repo
        self._tag_repo = tag_repo 

    async def _specialized_filters(self):
        if 'психиатр' in self._tags_titles:
            psychiatrists = set()
            for therapists in self._therapists:
                if therapists.psychiatrist:
                    psychiatrists.add(therapists)
            self._therapists = psychiatrists & self._therapists

        elif 'психиатр не нужен' in self._tags_titles:
            no_psychiatrists = set()
            for therapists in self._therapists:
                if not therapists.psychiatrist:
                    no_psychiatrists.add(therapists)
            self._therapists = no_psychiatrists & self._therapists

        if 'семейная терапия' in self._tags_titles:
            couple_therapists = set()
            for therapists in self._therapists:
                if therapists.couple_therapist:
                    couple_therapists.add(therapists)
            self._therapists = couple_therapists & self._therapists

        if "супервизор" in self._tags_titles:
            supervisors = set()
            for therapists in self._therapists:
                if therapists.supervisor:
                    supervisors.add(therapists)
            self._therapists = self._therapists & supervisors

    async def _territory_filters(self):
        is_online = set()
        in_one_city = set()
        if self._is_online:
            for therapist in self._therapists:
                if therapist.online:
                    is_online.add(therapist)

        if self._city:
            for therapist in self._therapists:
                if therapist.city == self._city:
                    in_one_city.add(therapist)

        self._therapists = (is_online | in_one_city) & self._therapists

    async def _demographic_filters(self):
        age_therapists = set()
        sex_therapists = set()

        for therapist in self._therapists:
            if therapist.min_client_age <= self._age <= therapist.max_client_age:
                age_therapists.add(therapist)

        if self._psychotherapist_sex:
            for therapist in self._therapists:
                if therapist.sex == self._psychotherapist_sex:
                    sex_therapists.add(therapist)

        self._therapists = age_therapists & sex_therapists & self._therapists

    async def _currency_filters(self):
        currency_therapists = set()
        for therapist in self._therapists:
            if (self._currency.get('RUB') and
                therapist.currency_amount.get('RUB') and
                self._currency.get('RUB')+500 <= therapist.currency_amount.get('RUB')):
                currency_therapists.add(therapist)

            elif (self._currency.get('USD') and
                therapist.currency_amount.get('USD') and
                self._currency.get('USD')+5 <= therapist.currency_amount.get('USD')):
                currency_therapists.add(therapist)

            elif (self._currency.get('EUR') and
                therapist.currency_amount.get('EUR') and
                self._currency.get('EUR')+5 <= therapist.currency_amount.get('EUR')):
                currency_therapists.add(therapist)

        self._therapists = self._therapists & currency_therapists

    async def _calculate_max_rank(self) -> float:
        return sum(tag.value if tag.value else 0 for tag in self._tags)

    async def _calculate_therapist_rank(self, therapist: Therapist) -> float:
        therapist_rank = 0
        therapist_tags = await self._therapist_tag_repo.get_therapist_tags(therapist_tg_id=therapist.tg_id)

        for tag in therapist_tags:
            if tag.title in self._tags_titles:
                therapist_rank += tag.value if tag.value else 0

        if therapist.group_therapy and "групповая терапия" in self._tags_titles:
            tag = await self._tag_repo.select_by_title(tag_title="групповая терапия")
            therapist_rank += tag.value if tag.value else 0

        if therapist.group_therapy and "геронтолог" in self._tags_titles:
            tag = await self._tag_repo.select_by_title(tag_title="геронтолог")
            therapist_rank += tag.value if tag.value else 0

        return therapist_rank

    async def get_therapists_by_request(self) -> dict[int, float]:
        await self._specialized_filters()
        await self._demographic_filters()
        await self._currency_filters()
        await self._territory_filters()
        max_rank = await self._calculate_max_rank()
        therapists_by_request = {}
        for therapist in self._therapists:
            therapist_rank = await self._calculate_therapist_rank(therapist=therapist)
            therapists_by_request[therapist.tg_id] = (max_rank / therapist_rank) * 100

        return therapists_by_request
