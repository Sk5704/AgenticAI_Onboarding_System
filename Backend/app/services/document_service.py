# At the top of the file, add import for UUID
from uuid import UUID, uuid4
import os
import asyncio
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.user import User
from app.models.application import Application
from app.models.document import Document
from app.utils.s3 import upload_file_to_s3, get_s3_key
from app.config import S3_BUCKET
from app.services.ai_pipeline_service import run_ai_pipeline

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def upload_document_service(db, phone: str, file, doc_type: str, application_id: str = None):
    """
    Upload a document for a user. If application_id is provided, use it; otherwise find by phone.
    """
    # Step 1: Get user and application
    if application_id:
        # Try to parse as UUID
        try:
            app_uuid = UUID(application_id)
        except ValueError:
            # If not a valid UUID, it might be a string ID from frontend
            # Try to find application by application_id string (if you have that field)
            # For now, return error
            return {"error": f"Invalid application_id format: {application_id}. Expected UUID format."}
        
        result = await db.execute(select(Application).where(Application.id == app_uuid))
        application = result.scalars().first()
        
        if not application:
            return {"error": "Application not found"}
        
        user_result = await db.execute(select(User).where(User.id == application.user_id))
        user = user_result.scalars().first()
        
    else:
        # Use phone to find user
        if not phone:
            return {"error": "Phone number is required when application_id is not provided"}
            
        result = await db.execute(select(User).where(User.phone == phone))
        user = result.scalars().first()
        
        if not user:
            return {"error": "User not found"}
        
        result = await db.execute(select(Application).where(Application.user_id == user.id))
        application = result.scalars().first()
        
        if not application:
            # Create a new application if missing
            application = Application(
                user_id=user.id, 
                application_status="not_started",
                application_step=1
            )
            db.add(application)
            await db.flush()
    
    # The rest of the function remains the same...
    # (Continue with the existing code from your document_service.py from the S3 upload part)
    
    # Step 2: Upload file to S3
    key = get_s3_key(str(application.id), doc_type, file.filename)
    await file.seek(0)
    await upload_file_to_s3(file.file, S3_BUCKET, key)

    # Step 3: Save document record
    result = await db.execute(
        select(Document).where(
            Document.application_id == application.id,
            Document.doc_type == doc_type
        )
    )
    existing_doc = result.scalars().first()
    
    if existing_doc:
        existing_doc.file_url = key
        existing_doc.status = "pending"
    else:
        new_doc = Document(
            application_id=application.id,
            doc_type=doc_type,
            file_url=key,
            status="pending"
        )
        db.add(new_doc)

    await db.flush()

    # Step 4: Count uploaded documents
    result = await db.execute(select(Document).where(Document.application_id == application.id))
    documents = result.scalars().all()
    doc_count = len(documents)

    # Step 5: Update application progress
    TOTAL_DOCS = 4  # pan, aadhaar, address, selfie
    if doc_count == 0:
        step = 1
    elif doc_count < TOTAL_DOCS:
        step = 3
    else:
        step = 5

    if doc_count == 0:
        status = "not_started"
    elif doc_count < TOTAL_DOCS:
        status = "in_progress"
    else:
        status = "under_review"

    await db.execute(
        update(Application)
        .where(Application.id == application.id)
        .values(application_step=step, application_status=status)
    )
    await db.commit()

    # Step 6: Trigger AI pipeline asynchronously if all documents uploaded
    if doc_count >= TOTAL_DOCS:
        # Run in background without blocking
        asyncio.create_task(run_ai_pipeline(str(application.id)))

    return {
        "message": "Uploaded successfully",
        "documents_uploaded": doc_count,
        "application_id": str(application.id)
    }