from pydantic import BaseModel
from dto.client_request import ClientRequestForAdmin
from dto.therapist import TherapistForAdmin


class Admin(BaseModel):
    tg_id: int
    username: str
    password: str


class MainInfoForAdmin(BaseModel):
    not_approved_client_requests: list[ClientRequestForAdmin]
    not_approved_therapists: list[TherapistForAdmin]
