from pydantic import BaseModel, field_validator
import re

class SendOTP(BaseModel):
    phone: str

    @field_validator("phone")
    def validate_phone(cls, v):
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Invalid phone number")
        return v
class VerifyOTP(BaseModel):
    phone: str
    otp: str