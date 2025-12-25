from fastapi import FastAPI
from sqlalchemy import text
from .db import engine

app = FastAPI(title="Job Application Tracker")


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
        # In real app, don't expose full error; this is just for early dev
        return {"db": "error", "detail": str(e)}
