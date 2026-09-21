"""add role and active status to users

Revision ID: 1b7c2d9e4a11
Revises: 0a1024c1cc01
"""
from alembic import op
import sqlalchemy as sa

revision = "1b7c2d9e4a11"
down_revision = "0a1024c1cc01"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(length=20), nullable=False, server_default="user"))
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_index("ix_users_role", "users", ["role"])

def downgrade() -> None:
    op.drop_index("ix_users_role", table_name="users")
    op.drop_column("users", "is_active")
    op.drop_column("users", "role")
