"""add not_specified value to sex enum

Revision ID: 9f2c1a4d7b11
Revises: 7e20a624b18d
Create Date: 2026-04-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '9f2c1a4d7b11'
down_revision: Union[str, Sequence[str], None] = '7e20a624b18d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE sex ADD VALUE IF NOT EXISTS 'not_specified'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values safely in place.
    pass
