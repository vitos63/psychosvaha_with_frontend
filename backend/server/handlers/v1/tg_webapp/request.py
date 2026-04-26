from typing import Literal

from pydantic import BaseModel


class TgWebAppFormSubmittedRequest(BaseModel):
    tg_id: int
    type: Literal["client", "therapist_first", "therapist_second"]
