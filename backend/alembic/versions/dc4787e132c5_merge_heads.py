"""merge heads

Revision ID: dc4787e132c5
Revises: b4ef55677ed1, f53ea161daa7
Create Date: 2026-05-02 22:50:28.703435

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc4787e132c5'
down_revision: Union[str, Sequence[str], None] = ('b4ef55677ed1', 'f53ea161daa7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
