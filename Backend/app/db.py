from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from app.config import DATABASE_URL

# For local development, remove SSL requirement
# Also ensure the URL uses postgresql+asyncpg for async operations
if DATABASE_URL.startswith("postgresql://"):
    # Convert to asyncpg URL format
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# Create async engine without SSL for local development
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # Set to False in production
    poolclass=NullPool,  # Disable connection pooling for simplicity
)
print("DATABASE_URL FROM ENV:", DATABASE_URL)
print("ASYNC DATABASE URL:", ASYNC_DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()
async def get_db():
    """Dependency that yields an async database session."""
    async with SessionLocal() as session:
        yield session