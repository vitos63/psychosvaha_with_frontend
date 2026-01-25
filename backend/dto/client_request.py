from typing import Optional

from pydantic import BaseModel
from .enums import Sex


class CreateClientRequest(BaseModel):
    client_id: int
    problem_description: str
    sex: Sex
    age: int
    currency_amount: dict
    city: Optional[str] = None
    is_online: bool
    psychotherapist_sex: Optional[Sex] = None
