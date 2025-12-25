from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from .db import engine, Base, get_db
from .models import user as user_model
from .schemas.user import UserCreate, UserOut
from .core.security import hash_password

app = FastAPI(title="Job Application Tracker")


@app.on_event("startup")
def on_startup():
    # Ensure models are imported so SQLAlchemy knows about them
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"db": "ok"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}


@app.post("/auth/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = (
        db.query(user_model.User)
        .filter(user_model.User.email == payload.email)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_pw = hash_password(payload.password)

    # Create user instance
    new_user = user_model.User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_pw,
    )

    # Save to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
