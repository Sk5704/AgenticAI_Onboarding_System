from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth_schema import SendOTP, VerifyOTP
from app.services.auth_service import send_otp_service, verify_otp_service
from app.services.session_service import get_session_service
from app.db import SessionLocal


router = APIRouter()


# DB dependency
async def get_db():
    async with SessionLocal() as session:
        yield session


# SEND OTP
@router.post("/send-otp")
async def send_otp_api(data: SendOTP):
    return await send_otp_service(data.phone)


# VERIFY OTP
@router.post("/verify-otp")
async def verify_otp_api(data: VerifyOTP, db: AsyncSession = Depends(get_db)):
    return await verify_otp_service(db, data.phone, data.otp)


# GET SESSION (Dashboard)
@router.get("/session")
async def get_session(phone: str, db: AsyncSession = Depends(get_db)):
    session = await get_session_service(db, phone)

    if not session:
        return {"error": "User not found"}

    return session