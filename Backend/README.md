# VectorX Banking API Backend

This folder contains a FastAPI backend for a banking-style onboarding and KYC workflow. It supports OTP-based login, application creation, document upload, application status tracking, a background AI verification pipeline, and a basic support-ticket flow.

The project is structured like a hackathon or MVP backend: the overall flow is in place, the API surface is usable, and the database model is defined, but some parts are still mocked or partially wired for production use.

## What This Backend Does

At a high level, the backend provides:

- OTP-based user entry for mobile numbers
- Customer application creation with personal details
- Document and selfie upload for onboarding
- Status polling for onboarding progress
- Support/contact ticket creation and lookup
- A background AI/KYC pipeline that logs OCR, face match, risk, compliance, and final decision steps

## Current State of the Project

The codebase is functional enough for local development and demos, but it is important to understand the current implementation details:

- OTP is mocked in memory and always generated as `123456`
- JWT-related settings exist in config, but JWT tokens are not currently issued by the API
- The AI pipeline in `app/services/ai_pipeline_service.py` uses mocked processing functions
- Dedicated agent modules exist in `app/agents/`, but the active pipeline currently does not call them
- S3/MinIO upload is implemented, and uploaded documents are stored using S3 keys
- Redis/RQ worker support exists in `app/worker.py`, but the document upload service currently starts the AI pipeline with `asyncio.create_task(...)` instead of queueing a job
- SQLAlchemy `Base.metadata.create_all()` runs at app startup
- Alembic is configured, but there are no versioned migration files in `alembic/versions/`

## Tech Stack

- Python
- FastAPI
- Uvicorn
- SQLAlchemy Async ORM
- PostgreSQL
- Alembic
- Redis + RQ
- Boto3 for S3/MinIO uploads
- Pydantic
- Python Dotenv
- LangChain / LangGraph listed as dependencies

## Dependencies

Dependencies are defined in [`requirements.txt`](requirements.txt):

- `fastapi[all]`
- `uvicorn`
- `sqlalchemy`
- `asyncpg`
- `psycopg2-binary`
- `alembic`
- `redis`
- `rq`
- `boto3`
- `python-multipart`
- `python-jose[cryptography]`
- `passlib[bcrypt]`
- `pydantic[email]`
- `pydantic-settings`
- `python-dotenv`
- `langgraph`
- `langchain`

## Project Structure

```text
Backend/
|-- alembic/
|   |-- env.py
|   |-- script.py.mako
|   `-- versions/
|-- app/
|   |-- agents/
|   |   |-- compliance_agent.py
|   |   |-- decision_agent.py
|   |   |-- face_agent.py
|   |   |-- ocr_agent.py
|   |   `-- risk_agent.py
|   |-- models/
|   |   |-- application.py
|   |   |-- document.py
|   |   |-- support_ticket.py
|   |   |-- user.py
|   |   `-- verification_log.py
|   |-- routes/
|   |   |-- auth_routes.py
|   |   |-- onboarding_routes.py
|   |   `-- support_routes.py
|   |-- schemas/
|   |   |-- auth_schema.py
|   |   `-- session_schema.py
|   |-- services/
|   |   |-- ai_pipeline_service.py
|   |   |-- auth_service.py
|   |   |-- document_service.py
|   |   |-- session_service.py
|   |   `-- support_service.py
|   |-- utils/
|   |   |-- otp.py
|   |   `-- s3.py
|   |-- config.py
|   |-- db.py
|   |-- main.py
|   `-- worker.py
|-- uploads/
|-- .env
|-- alembic.ini
|-- requirements.txt
|-- schema_update.sql
|-- setup_db.sql
`-- testing.py
```

## Core Application Flow

The intended user journey looks like this:

1. User submits phone number to request OTP
2. User verifies OTP
3. User creates an onboarding application with personal details
4. User uploads required documents:
   - PAN
   - Aadhaar
   - Address proof
   - Selfie
5. Backend marks the application as in progress or under review
6. Once all required documents are uploaded, the AI pipeline starts
7. Pipeline logs OCR, face match, risk, compliance, and final decision
8. Frontend polls the application status endpoint
9. User can create support tickets if needed

## API Overview

Base app title: `VectorX Banking API`

Main FastAPI app is defined in [`app/main.py`](app/main.py).

### Root Endpoint

- `GET /`
  - Returns a simple health-style message

### Auth Routes

Mounted at `/api/auth` from [`app/routes/auth_routes.py`](app/routes/auth_routes.py).

- `POST /api/auth/send-otp`
  - Request body:
    ```json
    {
      "phone": "9876543210"
    }
    ```
  - Validates Indian mobile number format
  - Returns a success response and the OTP value
  - Current behavior: OTP is mocked and returned directly

- `POST /api/auth/verify-otp`
  - Request body:
    ```json
    {
      "phone": "9876543210",
      "otp": "123456"
    }
    ```
  - Verifies the OTP against the in-memory store
  - Creates a `User` and `Application` if the phone number does not already exist

- `GET /api/auth/session?phone=9876543210`
  - Returns user/application/dashboard-style session information
  - Includes application state and document statuses

### Onboarding Routes

Mounted at `/api/onboarding` from [`app/routes/onboarding_routes.py`](app/routes/onboarding_routes.py).

- `POST /api/onboarding/create-application`
  - JSON body:
    ```json
    {
      "full_name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "dob": "1998-05-11",
      "address": "Mumbai, Maharashtra"
    }
    ```
  - Creates a user if missing
  - Creates an application and stores `personal_details` as JSON

- `POST /api/onboarding/upload-document`
  - Form-data fields:
    - `application_id` or `phone`
    - `doc_type`
    - `file`
  - Allowed document types:
    - `pan`
    - `aadhaar`
    - `addressProof`
    - `selfie`
  - Allowed file extensions:
    - `.jpg`
    - `.jpeg`
    - `.png`
    - `.pdf`
  - Uploads the file to S3/MinIO
  - Saves or updates a `Document` record
  - Updates application progress
  - Starts the AI pipeline once all 4 required documents are present

- `POST /api/onboarding/upload-selfie`
  - Form-data fields:
    - `application_id` or `phone`
    - `file`
  - Internally stores document type as `selfie`

- `GET /api/onboarding/status/{application_id}`
  - Returns:
    - application status
    - current step
    - progress percentage
    - risk score
    - pipeline stage
    - final approval result

### Support Routes

Mounted at `/api/support` from [`app/routes/support_routes.py`](app/routes/support_routes.py).

- `POST /api/support/contact`
  - JSON body:
    ```json
    {
      "application_id": "uuid-or-reference",
      "phone": "9876543210",
      "message": "I need help with my onboarding status"
    }
    ```
  - Creates a support ticket
  - Returns a human-readable ticket id like `TICKET_AB12CD34`

- `GET /api/support/ticket/{ticket_id}`
  - Returns details for a single ticket

- `GET /api/support/tickets/{phone}`
  - Returns all tickets associated with a phone number

## Data Model

The SQLAlchemy models live in [`app/models`](app/models).

### 1. User

Defined in [`app/models/user.py`](app/models/user.py).

Important fields:

- `id`
- `phone`
- `email`
- `full_name`
- `created_at`

### 2. Application

Defined in [`app/models/application.py`](app/models/application.py).

Important fields:

- `id`
- `user_id`
- `application_status`
- `application_step`
- `pipeline_stage`
- `kyc_status`
- `compliance_status`
- `risk_assessment`
- `final_approval`
- `risk_score`
- `personal_details`
- `created_at`
- `updated_at`

### 3. Document

Defined in [`app/models/document.py`](app/models/document.py).

Important fields:

- `id`
- `application_id`
- `doc_type`
- `file_url`
- `status`

`file_url` currently stores the S3 object key, not a public URL.

### 4. VerificationLog

Defined in [`app/models/verification_log.py`](app/models/verification_log.py).

Important fields:

- `id`
- `application_id`
- `step`
- `status`
- `details`
- `created_at`

This table is used to record each stage of the AI/KYC pipeline.

### 5. SupportTicket

Defined in [`app/models/support_ticket.py`](app/models/support_ticket.py).

Important fields:

- `id`
- `ticket_id`
- `application_id`
- `phone`
- `message`
- `status`
- `created_at`
- `updated_at`

## Database Setup

This project expects PostgreSQL.

Database-related files:

- [`app/db.py`](app/db.py)
- [`setup_db.sql`](setup_db.sql)
- [`schema_update.sql`](schema_update.sql)
- [`alembic.ini`](alembic.ini)
- [`alembic/env.py`](alembic/env.py)

### Notes About the Current DB Layer

- The app reads `DATABASE_URL` from `.env`
- If `DATABASE_URL` starts with `postgresql://`, the code rewrites it to `postgresql+asyncpg://` for async SQLAlchemy usage
- SQLAlchemy engine logging is enabled with `echo=True`
- `NullPool` is used
- Tables are auto-created at startup through `Base.metadata.create_all()`
- Alembic is configured, but migrations are not currently versioned in `alembic/versions/`

### Manual SQL Scripts

[`setup_db.sql`](setup_db.sql) creates:

- `users`
- `applications`
- `documents`
- `verification_logs`

[`schema_update.sql`](schema_update.sql) adds:

- missing `applications` columns
- `verification_logs`
- related index

Important note: the SQL scripts do not currently create the `support_tickets` table, even though the application model includes it. If you rely on support endpoints, make sure that table exists in your database.

## Environment Variables

Environment loading is handled in [`app/config.py`](app/config.py).

Create a local `.env` file with values like:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/vectorx
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
S3_BUCKET=vectorx-documents
S3_ENDPOINT=
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Variable Reference

- `DATABASE_URL`
  - Required
  - PostgreSQL connection string

- `SECRET_KEY`
  - Configured but not actively used for token generation in the current API flow

- `ALGORITHM`
  - JWT algorithm, default `HS256`

- `ACCESS_TOKEN_EXPIRE_MINUTES`
  - JWT expiry config, default `30`

- `REDIS_URL`
  - Redis connection for RQ worker support

- `S3_BUCKET`
  - Bucket name for document storage

- `S3_ENDPOINT`
  - Optional custom endpoint for MinIO or S3-compatible storage

- `AWS_REGION`
  - AWS region, default `ap-south-1`

- `AWS_ACCESS_KEY_ID`
  - S3 access key

- `AWS_SECRET_ACCESS_KEY`
  - S3 secret key

## Local Development Setup

### Prerequisites

- Python 3.11+ recommended
- PostgreSQL
- Redis
- S3 bucket or MinIO instance

### Install

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Run the API

```powershell
uvicorn app.main:app --reload
```

Default local URLs:

- API root: `http://127.0.0.1:8000/`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Test Database Connectivity

```powershell
python testing.py
```

This script runs a simple `SELECT 1` using the async engine.

### Optional Redis Worker

Worker helper code exists in [`app/worker.py`](app/worker.py).

Important note: the current upload flow uses `asyncio.create_task(...)` directly, so the RQ queue is not the active execution path right now. The worker module is available if you later want to switch to queued background processing.

## AI / KYC Pipeline

Main pipeline file: [`app/services/ai_pipeline_service.py`](app/services/ai_pipeline_service.py)

The pipeline currently performs these stages:

1. OCR
2. Face matching
3. Risk analysis
4. Compliance check
5. Final decision

For each stage, the service:

- updates `pipeline_stage`
- writes a `VerificationLog`
- eventually updates `Application`
- updates all `Document.status` values at the end

### Current Pipeline Behavior

This service is currently mocked:

- OCR returns hardcoded sample data
- Face match returns a hardcoded or simulated score
- Risk returns a mocked score
- Compliance returns a mocked status
- Final approval is decided from the mocked outputs

### Agent Modules

Additional agent files exist under [`app/agents`](app/agents):

- [`ocr_agent.py`](app/agents/ocr_agent.py)
- [`face_agent.py`](app/agents/face_agent.py)
- [`risk_agent.py`](app/agents/risk_agent.py)
- [`compliance_agent.py`](app/agents/compliance_agent.py)
- [`decision_agent.py`](app/agents/decision_agent.py)

These appear to represent the intended long-term modular pipeline. Some import heavier libraries such as OCR/image/face recognition packages, but those modules are not currently wired into the active service flow.

## File Uploads and Storage

Upload helpers live in [`app/utils/s3.py`](app/utils/s3.py).

Current behavior:

- Files are uploaded using `boto3`
- The storage key format is:
  - `{application_id}/{doc_type}/{filename}`
- A custom `S3_ENDPOINT` can be used for MinIO
- If no custom endpoint is set, the code builds an AWS regional S3 endpoint

There is also a local `uploads/` directory in this folder. The current document service creates the folder, but the actual upload implementation stores files in S3-compatible storage.

## CORS Configuration

Defined in [`app/main.py`](app/main.py).

Allowed origins:

- `http://localhost:8080`
- `http://127.0.0.1:8080`

If your frontend runs on a different host or port, update the CORS middleware settings.

## Important Implementation Notes

These are worth knowing before extending the project:

- OTP storage is in-memory only
  - restarting the server clears all OTPs
- OTP generation is hardcoded to `123456`
- Session response code references `user.name`, but the `User` model stores `full_name`
- `create_application` uses `full_name` correctly, but session serialization may need alignment
- `upload-document` accepts `addressProof`, while one agent uses `address_proof`
- `support_tickets` model exists, but setup SQL does not currently create that table
- `Base.metadata.create_all()` and Alembic are both present, which can lead to mixed migration practices if not standardized
- `app/db.py` prints database URLs to stdout, which is useful for debugging but should be reconsidered for production
- `.env`, `venv`, and uploaded/local-generated assets should not be committed

## Suggested Request/Response Examples

### Send OTP

```bash
curl -X POST "http://127.0.0.1:8000/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"9876543210\"}"
```

### Verify OTP

```bash
curl -X POST "http://127.0.0.1:8000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"9876543210\",\"otp\":\"123456\"}"
```

### Create Application

```bash
curl -X POST "http://127.0.0.1:8000/api/onboarding/create-application" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Rahul Sharma\",\"email\":\"rahul@example.com\",\"phone\":\"9876543210\",\"dob\":\"1998-05-11\",\"address\":\"Mumbai\"}"
```

### Upload Document

```bash
curl -X POST "http://127.0.0.1:8000/api/onboarding/upload-document" \
  -F "application_id=<application-uuid>" \
  -F "doc_type=pan" \
  -F "file=@pan.jpg"
```

### Check Status

```bash
curl "http://127.0.0.1:8000/api/onboarding/status/<application-uuid>"
```

### Create Support Ticket

```bash
curl -X POST "http://127.0.0.1:8000/api/support/contact" \
  -H "Content-Type: application/json" \
  -d "{\"application_id\":\"<application-uuid>\",\"phone\":\"9876543210\",\"message\":\"Please review my onboarding case\"}"
```

## How to Improve This Project

If you continue building this backend, strong next steps would be:

- replace the mocked OTP system with SMS delivery and expiry
- implement real JWT authentication and authorization
- standardize on Alembic migrations instead of mixed startup auto-create plus manual SQL
- move the AI pipeline to Redis/RQ or another durable background job runner
- wire the real agent modules into the active pipeline
- add proper test coverage
- create a `.env.example`
- add structured logging and error handling
- add support-ticket schema creation to migrations/SQL
- remove sensitive debug prints
- validate S3 uploads, mime types, and file sizes more strictly

## Quick Start Checklist

1. Create PostgreSQL database
2. Add a valid `.env`
3. Install Python dependencies
4. Start Redis if you plan to use worker-based background jobs
5. Ensure S3 bucket or MinIO is reachable
6. Run `uvicorn app.main:app --reload`
7. Open `/docs`

## Files Worth Reading First

- [`app/main.py`](app/main.py)
- [`app/config.py`](app/config.py)
- [`app/db.py`](app/db.py)
- [`app/routes/onboarding_routes.py`](app/routes/onboarding_routes.py)
- [`app/services/document_service.py`](app/services/document_service.py)
- [`app/services/ai_pipeline_service.py`](app/services/ai_pipeline_service.py)
- [`app/models/application.py`](app/models/application.py)

## Summary

This backend is a good base for a banking onboarding/KYC product with:

- a clean FastAPI route split
- async SQLAlchemy database access
- document upload support
- application lifecycle tracking
- a support-ticket subsystem
- a scaffolded AI verification pipeline

It is best understood as an MVP backend with several production-facing hooks already present, but with mocked verification/auth behavior that should be hardened before real deployment.
