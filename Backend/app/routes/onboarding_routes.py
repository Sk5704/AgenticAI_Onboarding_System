from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import re
from uuid import UUID

from app.services.document_service import upload_document_service
from app.db import SessionLocal
from app.models.user import User  # Add this import
from app.models.application import Application  # Add this import
from sqlalchemy.future import select

router = APIRouter()

ALLOWED_DOCS = ["pan", "aadhaar", "addressProof", "selfie"]
ALLOWED_EXTENSIONS = (".jpg", ".jpeg", ".png", ".pdf")
PHONE_REGEX = r"^[6-9]\d{9}$"   # Indian mobile format


async def get_db():
    async with SessionLocal() as session:
        yield session


# Pydantic model for personal details
class PersonalDetails(BaseModel):
    full_name: str
    email: str
    phone: str
    dob: str   # date in YYYY-MM-DD
    address: str


@router.post("/create-application")
async def create_application(
    details: PersonalDetails,
    db: AsyncSession = Depends(get_db)
):
    """Create a new application with personal details."""
    
    # Check if user exists by phone
    result = await db.execute(select(User).where(User.phone == details.phone))
    user = result.scalars().first()
    
    if not user:
        # Create a new user
        user = User(
        phone=details.phone,
        full_name=details.full_name,   # use full_name, not name
        email=details.email,
    )
    db.add(user)
    await db.flush()
    
    # Create application
    app = Application(
        user_id=user.id,
        application_status="not_started",
        application_step=1,
        personal_details=details.dict()
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    
    return {
        "application_id": str(app.id),
        "message": "Application created successfully"
    }


@router.post("/upload-document")
async def upload_document(
    application_id: str = Form(None),
    phone: str = Form(None),
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a document (PAN, Aadhaar, Address Proof)."""
    
    if not application_id and not phone:
        raise HTTPException(status_code=400, detail="Either application_id or phone must be provided")
    
    # Validate phone if provided
    if phone and not re.match(PHONE_REGEX, phone):
        raise HTTPException(status_code=400, detail="Invalid phone number. Must be 10 digits")
    
    # Validate document type
    if doc_type not in ALLOWED_DOCS:
        raise HTTPException(status_code=400, detail=f"Invalid document type. Allowed: {ALLOWED_DOCS}")
    
    # Validate file type
    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file format. Only JPG, PNG, PDF allowed")
    
    return await upload_document_service(db, phone, file, doc_type, application_id)


@router.post("/upload-selfie")
async def upload_selfie(
    application_id: str = Form(None),
    phone: str = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload selfie photo."""
    
    if not application_id and not phone:
        raise HTTPException(status_code=400, detail="Either application_id or phone must be provided")
    
    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    return await upload_document_service(db, phone, file, "selfie", application_id)


@router.get("/status/{application_id}")
async def get_application_status(
    application_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Polling endpoint to get current application status and progress.
    """
    # Validate UUID format
    try:
        app_uuid = UUID(application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

    result = await db.execute(select(Application).where(Application.id == app_uuid))
    app = result.scalars().first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Define step order for progress calculation
    status_map = {
        "not_started": 0,
        "in_progress": 25,
        "under_review": 50,
        "approved": 100,
        "rejected": 100
    }
    
    progress = status_map.get(app.application_status, 0)

    return {
        "application_id": str(app.id),
        "status": app.application_status,
        "step": app.application_step,
        "progress": progress,
        "risk_score": app.risk_score,
        "pipeline_stage": app.pipeline_stage,
        "final_approval": app.final_approval
    }