"""make feedback.tags nullable

Revision ID: eecf5ddd71b9
Revises: 5362340bf016
Create Date: 2026-01-09 18:36:43.840466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eecf5ddd71b9'
down_revision: Union[str, Sequence[str], None] = '5362340bf016'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
