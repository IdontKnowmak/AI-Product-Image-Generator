import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.community import GenerationComment, GenerationLike, SavedGeneration


class GenerationStatus(str, PyEnum):
    pending = "pending"
    completed = "completed"
    failed = "failed"


class GenerationType(str, PyEnum):
    product_scene = "product_scene"   # place product in a new scene/background
    ad_creative = "ad_creative"        # generate a marketing/ad style image


class Generation(Base):
    __tablename__ = "generations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    generation_type: Mapped[GenerationType] = mapped_column(
        Enum(GenerationType, name="generation_type"), nullable=False
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)

    source_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    result_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    status: Mapped[GenerationStatus] = mapped_column(
        Enum(GenerationStatus, name="generation_status"),
        default=GenerationStatus.pending,
        nullable=False,
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false", index=True)

    user: Mapped["User"] = relationship(back_populates="generations")
    likes: Mapped[list["GenerationLike"]] = relationship(back_populates="generation", cascade="all, delete-orphan")
    comments: Mapped[list["GenerationComment"]] = relationship(back_populates="generation", cascade="all, delete-orphan")
    saved_by: Mapped[list["SavedGeneration"]] = relationship(back_populates="generation", cascade="all, delete-orphan")
