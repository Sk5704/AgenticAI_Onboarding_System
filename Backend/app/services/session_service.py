from sqlalchemy.future import select
from app.models.user import User
from app.models.application import Application
from app.models.document import Document


async def get_session_service(db, phone):

    # Get user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()

    if not user:
        return None

    # Get application
    result = await db.execute(select(Application).where(Application.user_id == user.id))
    application = result.scalars().first()

    # Get documents
    result = await db.execute(select(Document).where(Document.application_id == application.id))
    documents = result.scalars().all()

    # Format document status
    doc_status = {
        "pan": "not_uploaded",
        "aadhaar": "not_uploaded",
        "addressProof": "not_uploaded",
        "selfie": "not_uploaded"
    }

    for doc in documents:
        doc_status[doc.doc_type] = doc.status

    return {
        "userId": str(user.id),
        "phone": user.phone,
        "name": user.name,

        "applicationStatus": application.application_status,
        "applicationStep": application.application_step,
        "pipelineStage": application.pipeline_stage,
        
        "documents": doc_status,

        "kycStatus": application.kyc_status,
        "complianceStatus": application.compliance_status,
        "riskAssessment": application.risk_assessment,
        "finalApproval": application.final_approval
    }