from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(nullable=False, unique=True)
    regular_expression: Mapped[str] = mapped_column(nullable=False)
    value: Mapped[int] = mapped_column(nullable=False)
