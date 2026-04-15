import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# JWT Authentication
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# S3 / MinIO
S3_BUCKET = os.getenv("S3_BUCKET", "vectorx-documents")
S3_ENDPOINT = os.getenv("S3_ENDPOINT", None)  # Optional, for MinIO
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")