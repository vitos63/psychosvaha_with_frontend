from pydantic import BaseModel


class TgWebAppFormSubmittedResponse(BaseModel):
    success: bool
