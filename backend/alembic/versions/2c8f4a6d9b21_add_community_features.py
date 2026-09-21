"""add public community, likes, comments, and saved images

Revision ID: 2c8f4a6d9b21
Revises: 1b7c2d9e4a11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "2c8f4a6d9b21"
down_revision = "1b7c2d9e4a11"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("generations", sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index("ix_generations_is_public", "generations", ["is_public"])
    op.create_table(
        "generation_likes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("generation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("generations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("generation_id", "user_id", name="uq_generation_like"),
    )
    op.create_index("ix_generation_likes_generation_id", "generation_likes", ["generation_id"])
    op.create_index("ix_generation_likes_user_id", "generation_likes", ["user_id"])
    op.create_table(
        "generation_comments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("generation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("generations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_generation_comments_generation_id", "generation_comments", ["generation_id"])
    op.create_index("ix_generation_comments_user_id", "generation_comments", ["user_id"])
    op.create_table(
        "saved_generations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("generation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("generations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("generation_id", "user_id", name="uq_saved_generation"),
    )
    op.create_index("ix_saved_generations_generation_id", "saved_generations", ["generation_id"])
    op.create_index("ix_saved_generations_user_id", "saved_generations", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_saved_generations_user_id", table_name="saved_generations")
    op.drop_index("ix_saved_generations_generation_id", table_name="saved_generations")
    op.drop_table("saved_generations")
    op.drop_index("ix_generation_comments_user_id", table_name="generation_comments")
    op.drop_index("ix_generation_comments_generation_id", table_name="generation_comments")
    op.drop_table("generation_comments")
    op.drop_index("ix_generation_likes_user_id", table_name="generation_likes")
    op.drop_index("ix_generation_likes_generation_id", table_name="generation_likes")
    op.drop_table("generation_likes")
    op.drop_index("ix_generations_is_public", table_name="generations")
    op.drop_column("generations", "is_public")
