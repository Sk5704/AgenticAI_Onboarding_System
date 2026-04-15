from sqlalchemy.future import select
from app.models.user import User
from app.models.application import Application
from app.utils.otp import send_otp, verify_otp


async def send_otp_service(phone):
    otp = send_otp(phone)
    return {"success": True, "otp": otp}


async def verify_otp_service(db, phone, otp):

    if not verify_otp(phone, otp):
        return {"success": False, "error": "Invalid OTP"}

    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()

    if not user:
        user = User(phone=phone)
        db.add(user)
        await db.flush()

        application = Application(user_id=user.id)
        db.add(application)
        await db.commit()

    return {"success": True}