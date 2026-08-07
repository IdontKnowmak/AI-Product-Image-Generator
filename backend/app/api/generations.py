# pyright: reportMissingImports=false
import uuid

from typing import Annotated
from fastapi import HTTPException

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.generation import Generation, GenerationStatus, GenerationType
from app.models.user import User
from app.schemas.generation import GenerationOut
from app.services.image_gen import generate_image
from app.services.storage import upload_image_bytes

router = APIRouter(prefix="/generations", tags=["generations"])


@router.post("", response_model=GenerationOut, status_code=201)
async def create_generation(
    generation_type: GenerationType = Form(...),
    prompt: str = Form(...),
    source_image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    source_bytes = await source_image.read() if source_image else None

    record = Generation(
        user_id=current_user.id,
        generation_type=generation_type,
        prompt=prompt,
        status=GenerationStatus.pending,
    )

    # Upload the source product photo so we keep a record of the input
    if source_bytes:
        try:
            record.source_image_url = upload_image_bytes(source_bytes, folder="sources")
        except Exception:
            pass  # non-fatal - we can still try to generate

    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        result_bytes = generate_image(prompt=prompt, source_image_bytes=source_bytes)
        result_url = upload_image_bytes(result_bytes, folder="results")

        record.result_image_url = result_url
        record.status = GenerationStatus.completed
    except Exception as exc:  # noqa: BLE001
        record.status = GenerationStatus.failed
        record.error_message = str(exc)

    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[GenerationOut])
def list_generations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Generation)
        .filter(Generation.user_id == current_user.id)
        .order_by(Generation.created_at.desc())
        .all()
    )


@router.get("/{generation_id}", response_model=GenerationOut)
def get_generation(
    generation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(Generation)
        .filter(Generation.id == generation_id, Generation.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Generation not found")
    return record

@router.delete("/{generation_id}")
def delete_generation(
    generation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(Generation)
        .filter(
            Generation.id == generation_id,
            Generation.user_id == current_user.id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Generation not found"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Generation deleted successfully"
    }
