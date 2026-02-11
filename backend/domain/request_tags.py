import re
from dto.enums import Tags as TagTitle

from database.models import ClientRequest, Tag


class ClientRequestDomain:
    def __init__(self, problem: str, need_psychiatrist: bool = None):
        self._problem = problem
        self._required_tag_titles = set()
        self._tag_titles_to_skip = set()

        if need_psychiatrist is True:
            self._required_tag_titles.add(TagTitle.NEED_PSYCHIATRIST)
            self._tag_titles_to_skip.add(TagTitle.DONT_NEED_PSYCHIATRIST)
        elif need_psychiatrist is False:
            self._required_tag_titles.add(TagTitle.DONT_NEED_PSYCHIATRIST)
            self._tag_titles_to_skip.add(TagTitle.NEED_PSYCHIATRIST)

    @classmethod
    def from_db_request(cls, request: ClientRequest) -> "ClientRequestDomain":
        return cls(
            problem=request.problem_description,
            need_psychiatrist=request.need_psychiatrist,
        )

    def get_matching_tags(self, all_tags: list[Tag]) -> list[Tag]:
        matched_tags = []

        for tag in all_tags:
            if tag.title in self._required_tag_titles:
                matched_tags.append(tag)
                continue

            if tag.title in self._tag_titles_to_skip:
                continue

            if not re.search(tag.regular_expression, self._problem, re.IGNORECASE):
                continue

            matched_tags.append(tag)
        return matched_tags
