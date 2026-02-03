from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ClientRequestTherapist(Base):
    __tablename__ = "client_request_therapists"

    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.tg_id", ondelete="CASCADE"),
        primary_key=True,
    )
    request_id: Mapped[int] = mapped_column(
        ForeignKey("client_requests.id", ondelete="CASCADE"),
        primary_key=True,
    )
    percentage_of_compliance: Mapped[float] = mapped_column(
        server_default="0"
    )
