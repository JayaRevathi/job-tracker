from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    position = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")
    applied_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User")
