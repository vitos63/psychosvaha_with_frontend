from pydantic import BaseModel


class CreateClientResponse(BaseModel):
    error: str | None
    request_id: int | None
