# VectorX Smart Banking (Frontend)

## Overview

This repository is a TypeScript + React + Vite web app for a smart banking onboarding flow (VectrX). The app supports:

- OTP-based phone authentication
- Application creation
- KYC document upload (PAN, Aadhaar, address proof)
- Selfie capture and upload
- Application status polling
- Dashboard view with verification status

This version is fully connected to a FastAPI backend via REST API.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment](#environment)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Authentication Flow](#authentication-flow)
6. [Onboarding Flow](#onboarding-flow)
7. [Dashboard](#dashboard)
8. [API Contract](#api-contract)
9. [Files and Key Components](#files-and-key-components)
10. [Security Practices](#security-practices)
11. [Error Handling](#error-handling)
12. [Deploy](#deploy)

---

## Quick Start

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd vectorx-smart-banking-main

# Install dependencies (npm / bun / pnpm supported)
npm install

# Start developer server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment

Add `.env` in project root:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

- `VITE_API_BASE_URL`: used by `src/lib/api.ts` as axios base URL.

---

## Architecture

- `src/main.tsx` starts the React app
- `src/pages/` contains route pages:
  - `Login.tsx`
  - `Onboarding.tsx`
  - `UserDashboard.tsx`
- `src/lib/api.ts`: axios configuration
- `src/lib/mock-auth.ts`: auth/session helper using backend and localStorage
- `src/components/ui/*`: UI primitives via shadcn and lucide icons

---

## Features

### 1. Login + OTP

- Enter phone number
- `POST /auth/send-otp` via `sendOtp()` in `src/lib/mock-auth.ts`
- Enter 6-digit OTP
- `POST /auth/verify-otp` via `verifyOtp()` in `src/lib/mock-auth.ts`
- On success, session status set and redirect to `/onboarding`

### 2. Onboarding steps

#### Step 1: Personal details

- full name, email, phone, dob, address
- validation (required, formats, age check)

#### Step 2: Phone verification

- OTP steps with resend and inline error
- On success:
  - `POST /onboarding/create-application`
  - store `application_id` in localStorage + state
  - `updateSession({ applicationId, applicationStatus: 'in_progress', applicationStep: 2 })`

#### Step 3: Document uploads

- Drag/drop or file select
- auto-upload with `uploadDocument(docType, file)`
  - `POST /onboarding/upload-document` multipart
- show per-document selected/verified state

#### Step 4: Selfie capture

- camera preview and capture
- converts to JPEG blob
- uploads to `POST /onboarding/upload-selfie` multipart
- sets session status to `under_review`, step 4

#### Step 5: Application status

- polling `GET /onboarding/status/{application_id}` every 2s
- when status `approved` or `rejected`, stop polling
- show dynamic account number and customer ID (from application ID)

### 3. Dashboard

- fetches `application_id` from existing session or localStorage
- calls `GET /onboarding/status/{application_id}`
- maps response to session view:
  - `applicationStatus`, `step`, `documents`, `kycStatus`, `complianceStatus`, `riskAssessment`, `finalApproval`
- shows progress, documents status, and actions

---

## Authentication Flow

### Session helper: `src/lib/mock-auth.ts`

- `getSession()` returns localStorage object
- `isLoggedIn()` checks session existence
- `logout()` removes localStorage session key
- `updateSession()` merges provided fields into existing session

Persisted keys:

- `vectorx_user` (session JSON)
- `application_id` (application ID for API calls)
- `phone` and `name` (auxiliary user info)

---

## Onboarding Flow

`src/pages/Onboarding.tsx` defines steps:

1. Personal Details
2. Verify Phone
3. Document Upload
4. Selfie Verification
5. Success/Status

Key helper functions:

- `handleSendOtp`
- `handleVerifyOtp` (OTP + create application)
- `validateDocuments`
- `uploadDocument` (single helper for each doc)
- `handleFileSelect` / `handleFileDrop` (uploads on selection)
- `captureSelfie` (camera, dataURL -> File -> upload)
- `startPolling` (status polling + finalization)

### Step 5 success data

- `accountNumber`: `VCTX-${application_id.slice(0,8).toUpperCase()}`
- `customerId`: `CID-${application_id.slice(0,6).toUpperCase()}`

---

## Dashboard

`src/pages/UserDashboard.tsx`:

- checks session; forces `/login` if missing
- fetches backend status for `application_id`
- updates user session object and UI based on real status
- displays:
  - application status banner
  - progress tracker (documents, KYC, compliance, risk, final approval)
  - documents table (PAN, Aadhaar, addressProof, selfie)

---

## API Contract (FastAPI)

### Auth

- `POST /api/auth/send-otp`
  - body: `{ phone: string }`
  - response: `{ success: true }`

- `POST /api/auth/verify-otp`
  - body: `{ phone: string, otp: string }`
  - response: `{ success: true }`

### Onboarding

- `POST /api/onboarding/create-application`
  - body: `{ full_name, email, phone, dob, address }`
  - response: `{ application_id: string, ... }`

- `POST /api/onboarding/upload-document`
  - multipart: `application_id`, `doc_type` (pan|aadhaar|addressProof), `file`
  - response: `{ documents_uploaded: number }`

- `POST /api/onboarding/upload-selfie`
  - multipart: `application_id`, `file`

- `GET /api/onboarding/status/{application_id}`
  - response all required status fields:
    - `application_id`, `status`, `step`, `progress`, `risk_score`, `pipeline_stage`, `final_approval`
    - optional: `documents`, `kyc_status`, `compliance_status`, `risk_assessment`

---

## Files and Key Components

- `src/lib/api.ts` (axios instance)
- `src/lib/mock-auth.ts` (bridge for auth + localStorage)
- `src/pages/Login.tsx` - OTP login
- `src/pages/Onboarding.tsx` - multi-step onboarding flow
- `src/pages/UserDashboard.tsx` - status and progress dashboard
- `src/components/ui/*` - shadcn UI components used through app

---

## Security Practices

- Keep tokens and private auth data out of localStorage in production
- Use HTTPS in `VITE_API_BASE_URL` in production
- Implement backend auth tokens for API endpoints (not in this scaffold)
- Sanitize/validate all user inputs on backend as well

---

## Error Handling

- `mock-auth` returns friendly message for OTP verify failures
- `Onboarding` shows toast for document/selfie upload failure
- polling errors are logged in console but do not break user flow

---

## Deploy

1. `npm run build`
2. host `dist` with static server (Netlify, Vercel, etc.)
3. set `VITE_API_BASE_URL` to production backend endpoint

### Build preview

```
npm run preview
```

---

## Notes

- The present implementation uses localStorage for session; swap to secure cookies or JWT + HTTP-only cookies for production.
- `OnboardingPage` currently preloads mock 123456 OTP in UI text but backend call should generate actual OTP in production.

---

## Troubleshooting

- If API 404, verify `VITE_API_BASE_URL` and backend routing.
- If CORS errors, configure backend CORS policy.
- If camera permission blocked, ensure browser has permission for selfie step.

---

## Future improvements

- Add server auth tokens and refresh workflow
- Add offline/pending upload queue
- Add document preview + delete support
- Add accessibility/keyboard support for all steps
- Add test suite (Vitest + React Testing Library)
