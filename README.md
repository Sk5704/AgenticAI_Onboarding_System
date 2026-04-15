# AgenticAI Onboarding System 🏦🤖

An end-to-end, cloud-ready banking onboarding platform that automates customer identity verification using a multi-agent AI orchestration layer. [cite_start]Built for high performance and regulatory compliance, the system reduces manual KYC efforts while ensuring robust fraud detection[cite: 3, 260].

## 🌟 Key Features
* [cite_start]**Multi-Agent Orchestration:** Utilizes **LangGraph** to coordinate 5 specialized AI agents for document extraction, biometric matching, compliance, and risk scoring[cite: 6, 92].
* [cite_start]**Government API Integration:** Real-time identity verification via official **NPCI (PAN)**, **UIDAI (Aadhaar)**, and **DigiLocker** gateways[cite: 257, 262, 272].
* **Asynchronous Processing:** Employs a non-blocking "handshake" architecture. [cite_start]The backend returns an application ID immediately while background workers process complex AI tasks[cite: 4, 119].
* [cite_start]**Real-time Status Polling:** A responsive frontend that provides step-by-step visual feedback as agents complete their individual tasks[cite: 61, 124].
* [cite_start]**Admin Monitoring Dashboard:** A dedicated interface for operations teams to track application pipelines, risk statistics, and manual review flags[cite: 53, 159].

---

## 🏗️ Technical Architecture

[cite_start]The system is built on a modern, asynchronous Python stack designed for scalability and auditability[cite: 8, 166].


### 🛠️ Tech Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js | [cite_start]Multi-step onboarding flow & Admin UI[cite: 12, 39]. |
| **API Framework** | FastAPI (Python) | [cite_start]High-performance async REST endpoints & auto-docs[cite: 14, 168]. |
| **AI Orchestration** | LangGraph | [cite_start]State-based workflow for agent coordination[cite: 16, 42]. |
| **Queue & Cache** | Redis + RQ | [cite_start]Lightweight background task execution[cite: 27, 43]. |
| **Database** | PostgreSQL | [cite_start]Persistent storage for users and applications[cite: 34, 168]. |
| **Cloud Storage** | AWS S3 (or MinIO) | [cite_start]Secure storage for sensitive KYC documents[cite: 35, 44]. |

---

## 🤖 The Agentic Pipeline (LangGraph)

[cite_start]The core intelligence is distributed across five specialized agents that process each application in a defined state graph[cite: 92, 180]:

1.  [cite_start]**OCR Agent (Qwen-VL):** Extracts text and numbers from uploaded PAN and Aadhaar cards[cite: 19, 93].
2.  [cite_start]**Face Verification Agent:** Compares the user's live selfie with the photo found on the Aadhaar document using `face_recognition` (dlib)[cite: 94, 180].
3.  [cite_start]**Compliance Agent:** Performs KYC/AML validation, ensuring PAN authenticity and age requirements (≥18) are met[cite: 182, 194].
4.  [cite_start]**Risk Agent:** Calculates a fraud confidence score (0-100) based on IP location, device ID, and document confidence[cite: 96, 209].
5.  [cite_start]**Decision Agent:** Aggregates all agent outputs to determine the final status: **Approved**, **Flagged for Review**, or **Rejected**[cite: 97, 337].

---

## 🚦 Implementation Status

- [x] [cite_start]**Database & Auth:** SQLAlchemy models and JWT-based security are fully implemented[cite: 234].
- [x] [cite_start]**Document Pipeline:** Functional `/upload` endpoint with S3/MinIO integration[cite: 234].
- [x] [cite_start]**AI Workflow:** LangGraph orchestrator integrated with background RQ workers[cite: 234].
- [x] [cite_start]**Frontend Flow:** Landing page, multi-step upload, and placeholder AI verification screens[cite: 45, 151].
- [ ] [cite_start]**Next Steps:** Enhance WebSocket support for real-time updates and integrate production-grade ML models for fraud scoring[cite: 253, 254].

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Redis Server (for task queuing)
* MinIO (for local S3 storage)

### Installation
1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/Anirudha-repo/AgenticAI_Onboarding_System.git
    cd AgenticAI_Onboarding_System
    ```
2.  [cite_start]**Environment Setup:** Create a `.env` file with your `DATABASE_URL`, `REDIS_URL`, and `S3_CREDENTIALS`[cite: 145].
3.  **Install Dependencies:**
    ```bash
    pip install -r Backend/requirements.txt
    ```
4.  **Run the API:**
    ```bash
    uvicorn Backend.app.main:app --reload
    ```
5.  **Start the Worker:**
    ```bash
    rq worker default
    ```

---

##  Compliance & Safety
[cite_start]This system uses **Synthetic Data Generation** (via `faker`) for testing to ensure no real user data is exposed during the development and hackathon phases[cite: 181, 183]. [cite_start]All agent steps are logged in a `VerificationLog` for full auditability[cite: 147].

[cite_start]**Team:** Developed for the Virtusa Project Implementation[cite: 1, 150].
