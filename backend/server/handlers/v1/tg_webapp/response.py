from pydantic import BaseModel


class TgWebAppFormSubmittedResponse(BaseModel):
    success: bool
    keyboard_removed: bool
    reason: str | None = None
