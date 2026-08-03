from database.models import Tag, Therapist


class ClientTherapistDomain:
    def __init__(self,
                 therapists_with_tags: list[tuple[Therapist, list[int], int]],
                 client_request_tags: list[Tag]):
        self.therapists_with_tags = therapists_with_tags
        self.client_request_tags = client_request_tags

    def __calculate_max_rank(self) -> int:
        max_rank = 0
        for tag in self.client_request_tags:
            max_rank += tag.value

        return max_rank

    def get_best_therapists_for_request(self) -> list[tuple[Therapist, int]]:
        max_rank = self.__calculate_max_rank()
        therapist_ratings = []
        for therapist, tags_values, recommendations_count in self.therapists_with_tags:
            rating = int((sum(tags_values) / max_rank) * 100)
            therapist_ratings.append((therapist, rating, recommendations_count))

        therapist_ratings.sort(key=lambda item: (-item[1], item[2]))
        return [
            (therapist, rating)
            for therapist, rating, _ in therapist_ratings[:3]
        ]
