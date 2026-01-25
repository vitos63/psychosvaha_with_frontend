from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
)
from sqlalchemy.orm import Mapped, mapped_column

from dto.enums import QueueStatus
from .base import Base


class Queue(Base):
    __tablename__ = "queue"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[QueueStatus] = mapped_column(Enum(QueueStatus), nullable=False)
