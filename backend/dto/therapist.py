from pydantic import BaseModel, field_validator, Field, ConfigDict
from email_validator import validate_email

from .enums import Sex
from enums.therapist_statuses import TherapistStatuses


class BaseTherapistDTO(BaseModel):
    first_name: str
    last_name: str
    city: str | None = None
    phone_number: str | None = None
    email: str | None = None
    photo: str | None = None
    pitch: str | None = None
    site: str | None = None
    sex: Sex
    age: int = Field(ge=20, le=90)
    experience: int

    min_client_age: int = Field(ge=1, le=120)
    max_client_age: int = Field(ge=2, le=120)
    online: bool = False
    currency_amount: dict
    contacts_for_client: str | None = None
    available_to_call: bool = False
    status: TherapistStatuses = TherapistStatuses.HAVE_QUESTIONARY

    tag_ids: list[int] = []

    model_config = ConfigDict(from_attributes=True)

    @field_validator("email")
    @classmethod
    def validate_email_field(cls, email: str | None) -> str | None:
        if email:
            validate_email(email)
        return email

    @field_validator("experience")
    @classmethod
    def validate_experience_field(cls, experience: int, info) -> int:
        age = info.data.get('age')
        if age - experience < 20:
            raise ValueError("Experience is not valid")
        return experience


class CreateTherapist(BaseModel):
    tg_id: int
    first_name: str
    last_name: str
    consent: bool = False

    model_config = ConfigDict(from_attributes=True)

class UpdateTherapist(BaseTherapistDTO):
    pass
