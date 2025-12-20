from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = "05d17f4c5d4b"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "organization",
        sa.Column("id", sa.UUID(), primary_key=True, default=uuid.uuid4),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("contact_name", sa.String(), nullable=False),
        sa.Column("contact_email", sa.String(), nullable=False),
        sa.Column("inference_url", sa.String(), nullable=False),
        sa.Column("reload_url", sa.String(), nullable=False),
        sa.Column("callback_url", sa.String(), nullable=True),
        sa.Column("hmac_secret", sa.Text(), nullable=False),
    )


def downgrade():
    op.drop_table("organization")
