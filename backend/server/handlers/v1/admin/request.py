from pydantic import BaseModel

from dto.client_request import ClientRequestForAdmin
from dto.therapist import TherapistForAdmin


class ApproveClientRequestRequest(ClientRequestForAdmin):
    pass


class ApproveTherapistRequest(TherapistForAdmin):
    pass


class DisapproveTherapistRequest(BaseModel):
    tg_id: int
