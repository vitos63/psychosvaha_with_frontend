from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    String,
    func,
    BigInteger
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from dto.enums import Sex

from .base import Base


class ClientRequest(Base):
    __tablename__ = "client_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    client_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    problem_description: Mapped[str] = mapped_column(nullable=False)
    sex: Mapped[Sex] = mapped_column(Enum(Sex), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_online: Mapped[bool] = mapped_column(nullable=False)
    currency_amount: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    psychotherapist_sex: Mapped[Sex | None] = mapped_column(Enum(Sex), nullable=True)
    need_psychiatrist: Mapped[bool | None] = mapped_column(nullable=True)

    is_approved: Mapped[bool] = mapped_column(nullable=False, default=False)

    therapists: Mapped[list["Therapist"]] = relationship(
        "Therapist",
        secondary="client_request_therapists",
        back_populates="client_requests"
    )

    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="client_requests_tags",
        back_populates="client_requests"
    )
