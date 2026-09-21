import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.generation import GenerationStatus, GenerationType


class GenerationCreate(BaseModel):
    generation_type: GenerationType
    prompt: str


class GenerationOut(BaseModel):
    id: uuid.UUID
    generation_type: GenerationType
    prompt: str
    source_image_url: str | None = None
    result_image_url: str | None = None
    is_public: bool = False
    status: GenerationStatus
    error_message: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
