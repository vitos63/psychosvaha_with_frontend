from pydantic import BaseModel


class CreateClientResponse(BaseModel):
    request_id: int | None
