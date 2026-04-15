import random

async def assess_risk(application_id: str, db, ocr_result, face_result):
    """
    Compute risk score (0-100, lower is better) based on:
    - device_id (simulated)
    - ip_country (simulated)
    - document_confidence_score (from OCR)
    - face_match_score
    - upload_time (time of day)
    - retry_attempts (number of uploads)
    """
    # For hackathon, we'll simulate these features
    device_id = random.choice(["known", "unknown"])
    ip_country = random.choice(["IN", "US", "RU"])
    document_confidence = ocr_result.get("confidence", 0.9)  # mock
    face_match = face_result.get("match_score", 0.0)
    upload_time = random.randint(0, 23)  # hour
    retry_attempts = random.randint(1, 5)

    # Simple scoring rules
    risk = 0
    if device_id == "unknown":
        risk += 20
    if ip_country != "IN":
        risk += 15
    if document_confidence < 0.7:
        risk += 25
    if face_match < 0.8:
        risk += 20
    if upload_time < 6 or upload_time > 22:
        risk += 10
    if retry_attempts > 3:
        risk += 15

    risk = min(risk, 100)  # cap at 100

    # Log
    from app.models.verification_log import VerificationLog
    log = VerificationLog(
        application_id=application_id,
        step="risk",
        status="completed",
        details={"risk_score": risk, "features": {
            "device_id": device_id,
            "ip_country": ip_country,
            "document_confidence": document_confidence,
            "face_match": face_match,
            "upload_time": upload_time,
            "retry_attempts": retry_attempts
        }}
    )
    db.add(log)
    await db.commit()

    return {"score": risk}    