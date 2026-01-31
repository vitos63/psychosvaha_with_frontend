from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class TherapistTag(Base):
    __tablename__ = "therapists_tags"

    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.tg_id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
