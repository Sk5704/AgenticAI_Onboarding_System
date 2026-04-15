from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"))

    doc_type = Column(String)  # pan, aadhaar, addressProof, selfie
    file_url = Column(String)  # now stores S3 key

    status = Column(String, default="pending")  # pending, verified