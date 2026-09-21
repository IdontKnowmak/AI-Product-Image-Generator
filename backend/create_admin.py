import sys

from app.core.database import SessionLocal
from app.models.user import User

if len(sys.argv) != 2:
    raise SystemExit("Usage: python create_admin.py user@example.com")

email = sys.argv[1].strip().lower()
with SessionLocal() as db:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise SystemExit(f"User not found: {email}. Register the account first.")
    user.role = "admin"
    user.is_active = True
    db.commit()
    print(f"Admin role granted to {email}")
