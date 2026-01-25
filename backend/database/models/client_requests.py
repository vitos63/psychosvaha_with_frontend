from datetime import datetime
from typing import Optional

from sqlalchemy import (
    JSON,
    String,
    DateTime,
    func,
    Enum,
)
from sqlalchemy.orm import Mapped, mapped_column

from dto.enums import Sex
from .base import Base


class ClientRequest(Base):
    __tablename__ = "client_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    client_id: Mapped[int] = mapped_column(nullable=False)
    problem_description: Mapped[str] = mapped_column(nullable=False)
    sex: Mapped[Sex] = mapped_column(Enum(Sex), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_online: Mapped[bool] = mapped_column(nullable=False)
    currency_amount: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    psychotherapist_sex: Mapped[Optional[Sex]] = mapped_column(Enum(Sex), nullable=True)
