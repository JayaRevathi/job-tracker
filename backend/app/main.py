from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import UploadFile, File
from fastapi.staticfiles import StaticFiles
import shutil
import os

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

from .db import engine, Base, get_db
from .models import user as user_model
from .models.application import Application
from .schemas.user import UserCreate, UserOut
from .schemas.auth import LoginRequest, TokenResponse
from .schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut
from .core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


app = FastAPI(title="Job Application Tracker")
security = HTTPBearer()

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Allow frontend (React) to call this API from http://localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.on_event("startup")
def on_startup():
    # Ensure models are imported so SQLAlchemy knows about them
    Base.metadata.create_all(bind=engine)

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> user_model.User:
    token = credentials.credentials  # the raw JWT string

    try:
        payload = decode_access_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no subject",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = db.query(user_model.User).filter(user_model.User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user




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


@app.post("/applications", response_model=ApplicationOut)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    app_obj = Application(
    position=payload.position,
    company=payload.company,
    status=payload.status,
    job_link=payload.job_link,
    notes=payload.notes,
    resume_name=payload.resume_name,
    user_id=current_user.id,
)
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.get("/applications", response_model=list[ApplicationOut])
def list_applications(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    query = db.query(Application).filter(Application.user_id == current_user.id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    return query.order_by(Application.id.desc()).all()


@app.get("/applications/{application_id}", response_model=ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    app_obj = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj

@app.put("/applications/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    app_obj = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    app_obj.position = payload.position
    app_obj.company = payload.company
    app_obj.status = payload.status
    app_obj.job_link = payload.job_link
    app_obj.notes = payload.notes
    app_obj.resume_name = payload.resume_name

    db.commit()
    db.refresh(app_obj)
    return app_obj

@app.delete("/applications/{application_id}", status_code=204)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    app_obj = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app_obj)
    db.commit()
    return
@app.post("/applications/{app_id}/upload-resume")
def upload_resume(app_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    app_obj = db.query(Application).filter(Application.id == app_id).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    app_obj.resume_name = file.filename
    db.commit()
    db.refresh(app_obj)

    return {"message": "Resume uploaded", "file": file.filename}