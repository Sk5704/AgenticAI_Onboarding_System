import asyncio
import boto3
from botocore.config import Config
from app.config import S3_BUCKET, S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION

# Configure S3 client
session = boto3.Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# Force virtual addressing style, which is required for modern S3 regions like ap-south-1
boto_config = Config(
    signature_version='s3v4',
    s3={'addressing_style': 'virtual'}
)

# If a custom endpoint is provided (for MinIO), use it; otherwise enforce the AWS regional endpoint
if S3_ENDPOINT:
    s3_client = session.client(
        's3',
        endpoint_url=S3_ENDPOINT,
        config=boto_config,
        region_name=AWS_REGION
    )
else:
    # Explicitly construct the regional endpoint to prevent global fallback
    regional_endpoint = f"https://s3.{AWS_REGION}.amazonaws.com"
    s3_client = session.client(
        's3', 
        endpoint_url=regional_endpoint,
        config=boto_config,
        region_name=AWS_REGION
    )

async def upload_file_to_s3(file_obj, bucket: str, key: str) -> str:
    """
    Upload a file-like object to S3 (AWS or MinIO).
    Returns the S3 key.
    """
    try:
        # boto3 upload is synchronous; run in thread pool
        await asyncio.to_thread(
            s3_client.upload_fileobj,
            file_obj, bucket, key
        )
        return key
    except Exception as e:
        raise Exception(f"S3 upload failed: {e}")

def get_s3_key(application_id: str, doc_type: str, filename: str) -> str:
    """Generate a unique S3 key for the document."""
    return f"{application_id}/{doc_type}/{filename}"