import asyncio
from sqlalchemy import update
from app.db import SessionLocal
from app.models.application import Application
from app.models.document import Document
from app.models.verification_log import VerificationLog
from sqlalchemy.future import select

# Mock functions (no external dependencies)
async def process_ocr(application_id, db):
    return {"pan": "ABCDE1234F", "name": "Test User", "confidence": 0.95}

async def verify_selfie(application_id, db):
    return {"match_score": 0.92}

async def assess_risk(application_id, db, ocr_result, face_result):
    return {"score": 25}

async def check_compliance(application_id, db, ocr_result):
    return {"status": "passed"}

async def make_decision(risk_result, compliance_result, face_result):
    return {"decision": "approve", "reason": "mock"}

async def run_ai_pipeline(application_id: str):
    """Main AI pipeline - runs as background task."""
    async with SessionLocal() as db:
        print(f"🚀 AI PIPELINE STARTED for {application_id}")

        # Update stage to OCR
        await db.execute(
            update(Application)
            .where(Application.id == application_id)
            .values(pipeline_stage="ocr_running")
        )
        await db.commit()

        ocr_result = await process_ocr(application_id, db)
        await log_verification(db, application_id, "ocr", "completed", ocr_result)

        # Face matching
        await db.execute(
            update(Application)
            .where(Application.id == application_id)
            .values(pipeline_stage="face_matching")
        )
        await db.commit()

        face_result = await verify_selfie(application_id, db)
        await log_verification(db, application_id, "face_match", "completed", face_result)

        # Risk analysis
        await db.execute(
            update(Application)
            .where(Application.id == application_id)
            .values(pipeline_stage="risk_analysis")
        )
        await db.commit()

        risk_result = await assess_risk(application_id, db, ocr_result, face_result)
        await log_verification(db, application_id, "risk", "completed", risk_result)

        # Compliance check
        compliance_result = await check_compliance(application_id, db, ocr_result)
        await log_verification(db, application_id, "compliance", "completed", compliance_result)

        # Final decision
        decision = await make_decision(risk_result, compliance_result, face_result)
        await log_verification(db, application_id, "decision", "completed", decision)

        # Update application final status
        final_status = "approved" if decision["decision"] == "approve" else "rejected"
        await db.execute(
            update(Application)
            .where(Application.id == application_id)
            .values(
                pipeline_stage="completed",
                application_status=final_status,
                final_approval=final_status,
                kyc_status="completed" if final_status == "approved" else "failed",
                compliance_status="completed" if final_status == "approved" else "failed",
                risk_assessment="completed",
                risk_score=risk_result["score"]
            )
        )

        # Update documents
        result = await db.execute(select(Document).where(Document.application_id == application_id))
        documents = result.scalars().all()
        for doc in documents:
            doc.status = "verified" if final_status == "approved" else "rejected"
        
        await db.commit()
        print(f"✅ AI PIPELINE COMPLETED for {application_id} with decision {decision['decision']}")

async def log_verification(db, application_id, step, status, details):
    """Helper to log verification steps."""
    log = VerificationLog(
        application_id=application_id,
        step=step,
        status=status,
        details=details if isinstance(details, dict) else {"result": details}
    )
    db.add(log)
    await db.commit()