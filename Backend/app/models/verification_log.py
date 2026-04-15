from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db import Base

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"))
    step = Column(String)          # e.g., "ocr", "face_match", "risk", "decision"
    status = Column(String)        # "pending", "completed", "failed"
    details = Column(JSON)         # any extra info like extracted data, scores
    created_at = Column(DateTime(timezone=True), server_default=func.now())