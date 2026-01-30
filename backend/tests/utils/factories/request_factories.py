from dto.enums import Sex
from server.handlers.v1.client_requests.create.request import CreateClientRequest

from .common import random_int, random_string


def build_create_client_request(**kwargs) -> CreateClientRequest:
    return CreateClientRequest(
        client_id=random_int(),
        problem_description=kwargs.get("problem_description", random_string()),
        sex=kwargs.get("sex", Sex.male),
        age=random_int(18, 60),
        currency_amount=kwargs.get("currency_amount", {}),
        city=kwargs.get("city"),
        is_online=kwargs.get("is_online", False),
        psychotherapist_sex=kwargs.get("psychotherapist_sex"),
        need_psychiatrist=kwargs.get("need_psychiatrist"),
    )
