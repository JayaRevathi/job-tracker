from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from .db import engine, Base, get_db
from .models import user as user_model
from .models.application import Application
from .schemas.user import UserCreate, UserOut
from .schemas.auth import LoginRequest, TokenResponse
from .core.security import hash_password, verify_password, create_access_token


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

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = (
        db.query(user_model.User)
        .filter(user_model.User.email == payload.email)
        .first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token (subject = user id)
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(access_token=access_token)
