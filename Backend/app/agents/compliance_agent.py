import re
from datetime import datetime

async def check_compliance(application_id: str, db, extracted_data: dict):
    """
    Check extracted data against KYC/AML rules.
    Returns compliance status and details.
    """
    from app.models.verification_log import VerificationLog
    from app.models.application import Application

    # Rule 1: Check if PAN is valid (basic format)
    pan = extracted_data.get("pan", "")
    pan_valid = bool(re.match(r"[A-Z]{5}[0-9]{4}[A-Z]{1}", pan))

    # Rule 2: Check if Aadhaar is 12-digit
    aadhaar = extracted_data.get("aadhaar", "").replace(" ", "")
    aadhaar_valid = bool(re.match(r"^\d{12}$", aadhaar))

    # Rule 3: Check if age > 18
    dob_str = extracted_data.get("dob", "")
    age_valid = False
    if dob_str:
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d")
            age = (datetime.now() - dob).days / 365.25
            age_valid = age >= 18
        except:
            pass

    # Rule 4: Address not empty
    address_valid = bool(extracted_data.get("address", ""))

    # Rule 5: Name matches between PAN and personal details
    # (we need personal details from application)
    from sqlalchemy.future import select
    app_result = await db.execute(select(Application).where(Application.id == application_id))
    app = app_result.scalars().first()
    personal_name = app.personal_details.get("full_name", "") if app.personal_details else ""
    extracted_name = extracted_data.get("name", "")
    name_match = (personal_name.lower() in extracted_name.lower()) or (extracted_name.lower() in personal_name.lower())

    compliance_passed = all([pan_valid, aadhaar_valid, age_valid, address_valid, name_match])
    details = {
        "pan_valid": pan_valid,
        "aadhaar_valid": aadhaar_valid,
        "age_valid": age_valid,
        "address_valid": address_valid,
        "name_match": name_match
    }

    # Log
    log = VerificationLog(
        application_id=application_id,
        step="compliance",
        status="completed" if compliance_passed else "failed",
        details=details
    )
    db.add(log)
    await db.commit()

    return {"status": "passed" if compliance_passed else "failed", "details": details}