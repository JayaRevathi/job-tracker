from datetime import datetime
from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    position: str
    company: str
    status: str = "Applied"
    job_link: str | None = None
    notes: str | None = None
    resume_name: str | None = None

class ApplicationUpdate(BaseModel):
    position: str
    company: str
    status: str
    job_link: str | None = None
    notes: str | None = None
    resume_name: str | None = None

class ApplicationOut(BaseModel):
    id: int
    position: str
    company: str
    status: str
    applied_date: datetime | None = None
    user_id: int | None = None

    job_link: str | None = None
    notes: str | None = None
    resume_name: str | None = None