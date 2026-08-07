"""initial schema - users and generations

Revision ID: 0a1024c1cc01
Revises:
Create Date: 2026-08-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0a1024c1cc01"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    generation_type_enum = postgresql.ENUM(
        "product_scene", "ad_creative", name="generation_type"
    )
    generation_status_enum = postgresql.ENUM(
        "pending", "completed", "failed", name="generation_status"
    )
    generation_type_enum.create(op.get_bind(), checkfirst=True)
    generation_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "generations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("generation_type", generation_type_enum, nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("source_image_url", sa.String(length=1024), nullable=True),
        sa.Column("result_image_url", sa.String(length=1024), nullable=True),
        sa.Column(
            "status",
            generation_status_enum,
            nullable=False,
            server_default="pending",
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_generations_user_id", "generations", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_generations_user_id", table_name="generations")
    op.drop_table("generations")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    postgresql.ENUM(name="generation_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="generation_type").drop(op.get_bind(), checkfirst=True)
