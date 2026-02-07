from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (BigInteger,
                        func,
                        DateTime,
                        String,
                        Enum,
                        JSON
                    )
from typing import Optional
from datetime import datetime

from .base import Base
from dto.enums import Sex


class Therapist(Base):
    __tablename__ = "therapists"

    tg_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    photo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    approved: Mapped[bool] = mapped_column(server_default='false')
    consent: Mapped[bool] = mapped_column(server_default='false')
    pitch: Mapped[Optional[str]] = mapped_column(String(350), nullable=True)
    site: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sex: Mapped[Sex | None] = mapped_column(Enum(Sex), nullable=True)
    age: Mapped[int] = mapped_column(nullable=False)
    experience: Mapped[int] = mapped_column(nullable=False)
    count_of_recomendations: Mapped[int] = mapped_column(server_default='0')

    min_client_age: Mapped[int] = mapped_column(nullable=False)
    max_client_age: Mapped[int] = mapped_column(nullable=False)
    online: Mapped[bool] = mapped_column(server_default='false')
    currency_amount: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    contacts_for_client: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    available_to_call: Mapped[bool] = mapped_column(server_default='false')
