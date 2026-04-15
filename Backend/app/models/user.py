from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)   # ← note: full_name, not name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # No is_verified column