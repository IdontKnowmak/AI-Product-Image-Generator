import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.generation import Generation
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    return {
        "users": db.query(func.count(User.id)).scalar() or 0,
        "active_users": db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        "generations": db.query(func.count(Generation.id)).scalar() or 0,
        "completed": db.query(func.count(Generation.id)).filter(Generation.status == "completed").scalar() or 0,
        "failed": db.query(func.count(Generation.id)).filter(Generation.status == "failed").scalar() or 0,
        "today_generations": db.query(func.count(Generation.id)).filter(Generation.created_at >= start).scalar() or 0,
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    counts = dict(db.query(Generation.user_id, func.count(Generation.id)).group_by(Generation.user_id).all())
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at, "generation_count": counts.get(u.id, 0)} for u in users]

@router.patch("/users/{user_id}/status")
def set_user_status(user_id: uuid.UUID, is_active: bool, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not is_active:
        raise HTTPException(status_code=400, detail="You cannot disable your own account")
    user.is_active = is_active
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}

@router.get("/generations")
def list_all_generations(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    rows = db.query(Generation, User.email).join(User, User.id == Generation.user_id).order_by(Generation.created_at.desc()).all()
    return [{"id": g.id, "user_id": g.user_id, "user_email": email, "generation_type": g.generation_type, "prompt": g.prompt, "result_image_url": g.result_image_url, "status": g.status, "error_message": g.error_message, "created_at": g.created_at} for g, email in rows]

@router.delete("/generations/{generation_id}")
def delete_generation(generation_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    generation = db.get(Generation, generation_id)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    db.delete(generation)
    db.commit()
    return {"message": "Generation deleted successfully"}
