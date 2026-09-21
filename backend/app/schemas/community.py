import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CommunityCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommunityCommentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    content: str
    created_at: datetime


class CommunityGenerationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    generation_type: str
    prompt: str
    result_image_url: str
    created_at: datetime
    like_count: int
    comment_count: int
    save_count: int
    liked: bool
    saved: bool


class CommunityDetailOut(CommunityGenerationOut):
    comments: list[CommunityCommentOut] = []


class ToggleOut(BaseModel):
    active: bool
    count: int
