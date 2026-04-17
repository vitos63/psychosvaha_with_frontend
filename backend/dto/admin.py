from pydantic import BaseModel


class Admin(BaseModel):
    tg_id: int
    login: str
    password: str
