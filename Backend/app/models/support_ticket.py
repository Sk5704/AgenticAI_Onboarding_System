from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(String, unique=True, index=True, nullable=False)  # human-readable ticket ID
    
    application_id = Column(String, nullable=True)  # application reference
    phone = Column(String, nullable=False, index=True)
    message = Column(Text, nullable=False)
    
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
