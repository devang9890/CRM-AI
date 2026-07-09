from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


revision = "eca94548a60e"
down_revision = "862f06b05b1c"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.add_column(
        "emails",
        sa.Column(
            "embedding",
            Vector(384),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("emails", "embedding")
