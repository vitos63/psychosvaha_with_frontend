from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ClientRequestTag(Base):
    __tablename__ = "client_requests_tags"

    request_id: Mapped[int] = mapped_column(
        ForeignKey("client_requests.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
