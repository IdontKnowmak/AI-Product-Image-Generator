import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.community import GenerationComment, GenerationLike, SavedGeneration
from app.models.generation import Generation, GenerationStatus
from app.models.user import User
from app.schemas.community import CommunityCommentCreate, CommunityCommentOut, CommunityDetailOut, CommunityGenerationOut, ToggleOut

router = APIRouter(prefix="/community", tags=["community"])


def public_image(db: Session, image_id: uuid.UUID) -> Generation:
    item = db.query(Generation).filter(Generation.id == image_id, Generation.status == GenerationStatus.completed, Generation.is_public.is_(True), Generation.result_image_url.isnot(None)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Public image not found")
    return item


def output(db: Session, item: Generation, user_id: uuid.UUID) -> CommunityGenerationOut:
    likes = db.query(func.count(GenerationLike.id)).filter(GenerationLike.generation_id == item.id).scalar() or 0
    comments = db.query(func.count(GenerationComment.id)).filter(GenerationComment.generation_id == item.id).scalar() or 0
    saves = db.query(func.count(SavedGeneration.id)).filter(SavedGeneration.generation_id == item.id).scalar() or 0
    liked = db.query(GenerationLike.id).filter(GenerationLike.generation_id == item.id, GenerationLike.user_id == user_id).first() is not None
    saved = db.query(SavedGeneration.id).filter(SavedGeneration.generation_id == item.id, SavedGeneration.user_id == user_id).first() is not None
    return CommunityGenerationOut(id=item.id, user_id=item.user_id, user_name=item.user.full_name or item.user.email.split("@")[0], generation_type=item.generation_type.value, prompt=item.prompt, result_image_url=item.result_image_url or "", created_at=item.created_at, like_count=likes, comment_count=comments, save_count=saves, liked=liked, saved=saved)


@router.get("", response_model=list[CommunityGenerationOut])
def list_public_images(sort: str = "newest", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Generation).filter(Generation.status == GenerationStatus.completed, Generation.is_public.is_(True), Generation.result_image_url.isnot(None))
    if sort == "popular":
        query = query.outerjoin(GenerationLike, GenerationLike.generation_id == Generation.id).group_by(Generation.id).order_by(func.count(GenerationLike.id).desc(), Generation.created_at.desc())
    else:
        query = query.order_by(Generation.created_at.desc())
    return [output(db, item, current_user.id) for item in query.limit(60).all()]


@router.get("/saved/list", response_model=list[CommunityGenerationOut])
def list_saved_images(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(SavedGeneration).join(Generation, Generation.id == SavedGeneration.generation_id).filter(SavedGeneration.user_id == current_user.id, Generation.status == GenerationStatus.completed, Generation.is_public.is_(True)).order_by(SavedGeneration.created_at.desc()).all()
    return [output(db, row.generation, current_user.id) for row in rows]


@router.get("/{generation_id}", response_model=CommunityDetailOut)
def get_public_image(generation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = public_image(db, generation_id)
    base = output(db, item, current_user.id)
    rows = db.query(GenerationComment).filter(GenerationComment.generation_id == generation_id).order_by(GenerationComment.created_at.asc()).all()
    return CommunityDetailOut(**base.model_dump(), comments=[CommunityCommentOut(id=row.id, user_id=row.user_id, user_name=row.user.full_name or row.user.email.split("@")[0], content=row.content, created_at=row.created_at) for row in rows])


@router.post("/{generation_id}/like", response_model=ToggleOut)
def toggle_like(generation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    public_image(db, generation_id)
    row = db.query(GenerationLike).filter(GenerationLike.generation_id == generation_id, GenerationLike.user_id == current_user.id).first()
    active = row is None
    if row: db.delete(row)
    else: db.add(GenerationLike(generation_id=generation_id, user_id=current_user.id))
    db.commit()
    count = db.query(func.count(GenerationLike.id)).filter(GenerationLike.generation_id == generation_id).scalar() or 0
    return ToggleOut(active=active, count=count)


@router.post("/{generation_id}/save", response_model=ToggleOut)
def toggle_save(generation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    public_image(db, generation_id)
    row = db.query(SavedGeneration).filter(SavedGeneration.generation_id == generation_id, SavedGeneration.user_id == current_user.id).first()
    active = row is None
    if row: db.delete(row)
    else: db.add(SavedGeneration(generation_id=generation_id, user_id=current_user.id))
    db.commit()
    count = db.query(func.count(SavedGeneration.id)).filter(SavedGeneration.generation_id == generation_id).scalar() or 0
    return ToggleOut(active=active, count=count)


@router.post("/{generation_id}/comments", response_model=CommunityCommentOut, status_code=201)
def add_comment(generation_id: uuid.UUID, payload: CommunityCommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    public_image(db, generation_id)
    content = payload.content.strip()
    if not content: raise HTTPException(status_code=400, detail="Comment cannot be empty")
    row = GenerationComment(generation_id=generation_id, user_id=current_user.id, content=content)
    db.add(row); db.commit(); db.refresh(row)
    return CommunityCommentOut(id=row.id, user_id=current_user.id, user_name=current_user.full_name or current_user.email.split("@")[0], content=row.content, created_at=row.created_at)


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.query(GenerationComment).filter(GenerationComment.id == comment_id, GenerationComment.user_id == current_user.id).first()
    if not row: raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(row); db.commit()
    return {"message": "Comment deleted successfully"}
