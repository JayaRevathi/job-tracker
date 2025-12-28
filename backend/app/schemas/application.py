from datetime import datetime
from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    position: str
    company: str
    status: str = "Applied"

class ApplicationOut(BaseModel):
    id: int
    position: str
    company: str
    status: str
    applied_date: datetime | None = None
    user_id: int | None = None

    class Config:
        orm_mode = True
