# SafeSphere AI — Production FastAPI Backend

> **Predict Danger Before It Happens.**  
> Production-grade Python / FastAPI backend for spatial-temporal risk forecasting, AI SafeRoute navigation, Gemini Explainable AI (XAI) rationale generation, and automated Guardian Circle emergency dispatches.

---

## Architecture Highlights

- **Framework:** Python 3.11+ / Async FastAPI with Uvicorn.
- **Design Pattern:** Modular Layered Architecture (Repository Pattern, Dependency Injection, SOLID Principles).
- **Authentication:** JWT Bearer authentication + Firebase Auth validation pipeline.
- **Geospatial Indexing:** Uber H3 resolution 8 (~0.7 km²) & resolution 9 (~0.1 km²) spatial indexing.
- **AI Risk Engine:** Spatial decay kernel model synthesizing community incident density, streetlight illumination, pedestrian crowd sparsity, and historical crime severity.
- **Explainable AI (XAI):** Pluggable Gemini 1.5 Flash API interface with sub-800ms deterministic fallbacks.
- **Guardian Engine:** Automated contextual alert generation with WebRTC/Firestore live tracking tokens.

---

## Directory Structure

```
backend/
├── main.py
├── requirements.txt
├── README.md
├── .env.example
├── Dockerfile
├── api/
│   └── v1/
│       ├── router.py
│       └── endpoints/
│           ├── auth.py
│           ├── profile.py
│           ├── guardians.py
│           ├── reports.py
│           ├── risk.py
│           ├── routes.py
│           ├── notifications.py
│           └── health.py
├── core/
│   ├── config.py
│   ├── dependencies.py
│   ├── exceptions.py
│   ├── logging.py
│   └── security.py
├── firebase/
│   ├── firebase_app.py
│   └── firestore_client.py
├── repositories/
│   ├── base_repository.py
│   ├── user_repository.py
│   ├── report_repository.py
│   └── risk_repository.py
├── schemas/
│   ├── user.py
│   ├── guardian.py
│   ├── report.py
│   ├── risk.py
│   ├── route.py
│   └── notification.py
└── services/
    ├── auth_service.py
    ├── community_service.py
    ├── gemini_xai_service.py
    ├── guardian_service.py
    ├── maps_service.py
    ├── notification_service.py
    ├── risk_engine_service.py
    └── saferoute_service.py
```

---

## Quick Start & Installation

### 1. Environment Setup
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Local Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. API Documentation
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/v1/health`

---

## Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check and service readiness status |
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/auth/login` | User login & JWT token dispatch |
| `GET` | `/api/v1/profile` | Get current user profile |
| `PUT` | `/api/v1/profile/preferences` | Update safety threshold preferences |
| `GET` | `/api/v1/guardians` | List registered Guardians |
| `POST` | `/api/v1/guardians` | Add a new Guardian |
| `POST` | `/api/v1/guardians/alert` | Trigger Level 2 emergency alert to Guardians |
| `POST` | `/api/v1/reports` | Submit community incident report |
| `GET` | `/api/v1/reports` | Query community incident reports |
| `POST` | `/api/v1/risk/evaluate` | Calculate spatial risk score R(s, t) for lat/lng |
| `GET` | `/api/v1/risk/forecast` | Forecast dynamic risk score shifts over 60 min |
| `POST` | `/api/v1/routes/calculate` | Calculate Safest vs Fast-Balanced navigation routes |
| `POST` | `/api/v1/notifications/send` | Dispatch multi-channel push/SMS alert |
