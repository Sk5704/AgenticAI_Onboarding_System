import asyncio
from sqlalchemy import text
from app.db import engine
from app.config import DATABASE_URL

async def test_db():
    print(f"Testing connection to: {DATABASE_URL}")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())