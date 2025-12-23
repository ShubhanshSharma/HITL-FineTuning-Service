"""added version to org; then added tags and rating to feedback

Revision ID: e554bb947562
Revises: 42b57e0b4b7d
Create Date: 2025-12-22 21:47:56.647359
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "e554bb947562"
down_revision: Union[str, Sequence[str], None] = "42b57e0b4b7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


feedback_tag_enum = postgresql.ENUM(
    "hallucination",
    "incorrect",
    "speculative",
    "incomplete",
    "overcomplete",
    "partial_compliance",
    "wrong_format",
    "ignored_constraints",
    "unclear",
    "verbose",
    "too_short",
    "unsafe",
    "policy_violation",
    name="feedback_tag_enum",
)


def upgrade() -> None:
    # --- create enum type first ---
    feedback_tag_enum.create(op.get_bind(), checkfirst=True)

    # --- add tags column safely ---
    op.add_column(
        "feedback",
        sa.Column(
            "tags",
            sa.ARRAY(feedback_tag_enum),
            nullable=True,
            server_default="{}",
        ),
    )

    # --- backfill existing rows ---
    op.execute("UPDATE feedback SET tags = '{}' WHERE tags IS NULL")

    # --- enforce NOT NULL and remove default ---
    op.alter_column(
        "feedback",
        "tags",
        nullable=False,
        server_default=None,
    )

    # --- add rating with constraint ---
    op.add_column(
        "feedback",
        sa.Column("rating", sa.Integer(), nullable=False),
    )
    op.create_check_constraint(
        "rating_valid_values",
        "feedback",
        "rating IN (-1, 0, 1)",
    )

    # --- add organization version ---
    op.add_column(
        "organization",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.alter_column(
        "organization",
        "version",
        server_default=None,
    )


def downgrade() -> None:
    # --- drop org version ---
    op.drop_column("organization", "version")

    # --- drop rating + constraint ---
    op.drop_constraint("rating_valid_values", "feedback", type_="check")
    op.drop_column("feedback", "rating")

    # --- drop tags ---
    op.drop_column("feedback", "tags")

    # --- drop enum type ---
    feedback_tag_enum.drop(op.get_bind(), checkfirst=True)
