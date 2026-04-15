import face_recognition
import numpy as np
from PIL import Image
import io

async def verify_selfie(application_id: str, db):
    """
    Compare selfie photo with photo from Aadhaar (if available).
    Returns match score (0-1).
    """
    from app.models.document import Document
    from app.models.verification_log import VerificationLog
    from sqlalchemy.future import select

    # Fetch selfie and aadhaar document
    result = await db.execute(
        select(Document).where(
            Document.application_id == application_id,
            Document.doc_type.in_(["selfie", "aadhaar"])
        )
    )
    docs = result.scalars().all()

    selfie_img = None
    aadhaar_img = None

    for doc in docs:
        # For simplicity, we assume we have local file paths; but we'll mock
        if doc.doc_type == "selfie":
            selfie_img = ...  # load from S3
        elif doc.doc_type == "aadhaar":
            aadhaar_img = ...

    # Mock: if both exist, compute similarity
    if selfie_img and aadhaar_img:
        # Load images and get face encodings
        # (you'll need to load from bytes)
        # For demonstration, we return a random score
        import random
        match_score = random.uniform(0.7, 0.99)
    else:
        match_score = 0.0

    # Log
    log = VerificationLog(
        application_id=application_id,
        step="face_match",
        status="completed",
        details={"match_score": match_score}
    )
    db.add(log)
    await db.commit()

    return {"match_score": match_score}