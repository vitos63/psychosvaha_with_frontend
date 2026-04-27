"""add_avatar_path_to_therapist

Revision ID: f53ea161daa7
Revises: 9f2c1a4d7b11
Create Date: 2026-04-27 10:34:21.724969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f53ea161daa7'
down_revision: Union[str, Sequence[str], None] = '9f2c1a4d7b11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.add_column(
        "therapists",
        sa.Column("avatar_path", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("therapists", "avatar_path")