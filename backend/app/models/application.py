from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    position = Column(String, nullable=False)
    company = Column(String, nullable=False)
    status = Column(String, default="Applied")
    applied_date = Column(DateTime, default=datetime.utcnow)

    job_link = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    resume_name = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))
