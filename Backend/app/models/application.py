from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Application status and progress
    application_status = Column(String, default="not_started")  # not_started, in_progress, under_review, approved, rejected
    application_step = Column(Integer, default=1)               # 1-5 (personal, docs, selfie, ai, risk)
    pipeline_stage = Column(String, default="not_started")     # for AI pipeline tracking

    # KYC / compliance flags
    kyc_status = Column(String, default="pending")
    compliance_status = Column(String, default="pending")
    risk_assessment = Column(String, default="pending")
    final_approval = Column(String, default="pending")

    # Risk score (0-100)
    risk_score = Column(Integer, nullable=True)

    # Personal details stored as JSON (name, email, phone, dob, address)
    personal_details = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())