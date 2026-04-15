from pydantic import BaseModel
from typing import Dict

class SessionResponse(BaseModel):
    userId: str
    phone: str
    name: str | None

    applicationStatus: str
    applicationStep: int

    documents: Dict[str, str]

    kycStatus: str
    complianceStatus: str
    riskAssessment: str
    finalApproval: str