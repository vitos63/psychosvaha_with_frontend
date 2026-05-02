from typing import Literal

from pydantic import BaseModel


class TgWebAppFormSubmittedRequest(BaseModel):
    tg_id: int
    form_type: Literal["client", "therapist_first", "therapist_second"]
