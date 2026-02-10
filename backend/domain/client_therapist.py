from database.models import Therapist, Tag


class ClientTherapistDomain:
    def __init__(self,
                 therapists_with_tags: list[Therapist, list[int]],
                 tags: list[Tag],
                 client_request_tags: list[Tag]):
        self.therapists_with_tags = therapists_with_tags
        self.tags = tags
        self.client_request_tags = client_request_tags

    def __calculate_max_rank(self) -> int:
        max_rank = 0
        for tag in self.client_request_tags:
            max_rank += tag.value

        return max_rank

    def get_best_therapists_for_request(self) -> list[tuple[Therapist, int]]:
        max_rank = self.__calculate_max_rank()
        therapist_rating = {}
        for therapist, tags_values in self.therapists_with_tags:
            therapist_rating[therapist] = int(max_rank / sum(tags_values))

        therapist_rating = sorted(therapist_rating.items(), key=lambda x: x[1], reverse=True)[:3]
        return therapist_rating
