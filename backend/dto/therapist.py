from pydantic import BaseModel, field_validator, Field
from email_validator import validate_email

from .enums import Sex


class CreateTherapist(BaseModel):
    first_name: str
    last_name: str
    city: str | None = None
    phone_number: str | None = None
    email: str | None = None
    photo: str | None = None
    approved: bool = False
    consent: bool = False
    pitch: str | None = None
    site: str | None = None
    sex: Sex | None = None
    age: int = Field(ge=20, le=90)
    experience: int
    count_of_recomendations: int = 0

    min_client_age: int = Field(ge=1, le=120)
    max_client_age: int = Field(ge=2, le=120)
    online: bool = False
    currency_amount: dict
    contacts_for_client: str | None = None
    psychiatrist: bool = False
    group_therapy: bool = False
    supervisor: bool = False
    gerontologist: bool = False
    couple_therapist: bool = False
    available_to_call: bool = False

    tag_ids: list[int] = []

    @field_validator("email")
    @classmethod
    def validate_email_field(cls, email: str) -> str:
        validate_email(email)
        return email

    @field_validator("experience")
    @classmethod
    def validate_experience_field(cls, experience: int) -> int:
        if cls.age - experience < 20:
            raise ValueError("Experience is not valid")
        return experience
