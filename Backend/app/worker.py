import asyncio
from redis import Redis
from rq import Queue
from app.config import REDIS_URL

# Redis connection
redis_conn = Redis.from_url(REDIS_URL)
queue = Queue(connection=redis_conn)

def enqueue_ai_pipeline(application_id: str):
    """Enqueue the AI pipeline job for the given application."""
    queue.enqueue(run_ai_pipeline_job, application_id)

def run_ai_pipeline_job(application_id: str):
    """Synchronous wrapper for the async pipeline."""
    # Use asyncio.run() to run the async function
    asyncio.run(run_ai_pipeline_async(application_id))

async def run_ai_pipeline_async(application_id: str):
    """Async function that will run the LangGraph workflow."""
    from app.services.ai_pipeline_service import run_ai_pipeline
    await run_ai_pipeline(application_id)