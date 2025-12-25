from fastapi import FastAPI
from sqlalchemy import text

from .db import engine, Base

app = FastAPI(title="Job Application Tracker")


@app.on_event("startup")
def on_startup():
    # Import models so they are registered with SQLAlchemy
    from .models import user  # noqa: F401

    # Create tables if they do not exist
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
