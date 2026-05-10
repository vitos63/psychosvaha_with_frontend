from sqlalchemy import BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from passlib.context import CryptContext

from .base import Base


pwd_context = CryptContext(
    schemes=["argon2"], 
    deprecated="auto"
)


class Admin(Base):
    __tablename__ = 'admin'

    tg_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True
    )
    username: Mapped[str] = mapped_column(
        unique=True
    )
    _password: Mapped[str] = mapped_column(
        "password",
        nullable=False
    )

    @property
    def password(self):
        raise AttributeError("Password is not readable")
    
    @password.setter
    def password(self, password: str):
        self._password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self._password)
