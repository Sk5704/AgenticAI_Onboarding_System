import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import io
import os

async def process_ocr(application_id: str, db):
    """
    Extract text from uploaded documents (PAN, Aadhaar, Address Proof).
    Returns extracted data as dict.
    """
    from app.models.document import Document
    from app.models.verification_log import VerificationLog
    from sqlalchemy.future import select

    # Fetch documents for this application
    result = await db.execute(
        select(Document).where(Document.application_id == application_id)
    )
    documents = result.scalars().all()

    extracted_data = {}

    for doc in documents:
        # Get S3 key from file_url (store as S3 key)
        s3_key = doc.file_url
        # For local testing: you might have saved the file; we'll download from S3 or use local path
        # For hackathon, we'll assume the file is accessible locally or via S3.
        # Simpler: we'll use the local file path if we saved it earlier.
        # Since we moved to S3, we need to download the file to a temp location.
        # For now, we'll mock extraction; you can implement actual download and OCR.

        # Mock for demo:
        if doc.doc_type == "pan":
            extracted_data["pan"] = "ABCDE1234F"
            extracted_data["name"] = "John Doe"
        elif doc.doc_type == "aadhaar":
            extracted_data["aadhaar"] = "1234 5678 9012"
            extracted_data["dob"] = "1990-01-01"
        elif doc.doc_type == "address_proof":
            extracted_data["address"] = "123 Main St, Mumbai"

    # You can log the extraction
    log = VerificationLog(
        application_id=application_id,
        step="ocr",
        status="completed",
        details=extracted_data
    )
    db.add(log)
    await db.commit()

    return extracted_data