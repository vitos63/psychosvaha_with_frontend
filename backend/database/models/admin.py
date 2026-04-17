from sqlalchemy import BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Admin(Base):
    __tablename__ = 'admin'

    tg_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True
    )
    login: Mapped[str] = mapped_column(
        unique=True
    )
    password: Mapped[str] = mapped_column(
        nullable=False
    )
