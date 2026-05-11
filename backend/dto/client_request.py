from pydantic import BaseModel, ConfigDict

from .enums import Sex


class CreateClientRequest(BaseModel):
    client_id: int
    problem_description: str
    sex: Sex
    age: int
    currency_amount: dict
    city: str | None = None
    is_online: bool
    psychotherapist_sex: Sex | None = None
    need_psychiatrist: bool | None = None


class ClientRequestForAdmin(BaseModel):
    id: int
    problem_description: str
    tags: list[str]

    model_config = ConfigDict(from_attributes=True)
