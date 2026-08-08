# SafeSphere AI — Forensic Audit: API_STATUS.md

## Overview

This report details the operational status, endpoint paths, integration readiness, data verification, and fallback handling for all internal and external services integrated into SafeSphere AI.

---

## 1. External Integrations Matrix

| Service | Configured | Reachable | Authenticated | Used By | Status | Details / Fallback Strategy |
| :--- | :---: | :---: | :---: | :--- | :---: | :--- |
| **Google Maps JS API** | Yes | Yes | Valid Key | Map Page (`/map`), Directions | **WORKING** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configured in `.env.local`. |
| **Google Places API** | Yes | Yes | Valid Key | Autocomplete, Safe Havens | **WORKING** | Emergency nearby search retrieves police/hospitals via `/api/v1/places/emergency-nearby`. |
| **Supabase Authentication** | Yes | Yes | Demo/Anon Key | Login, Signup, Session | **WORKING** | Standard Supabase JWT validation with fallback to demo profile `sub_ananya_01`. |
| **Firebase / Firestore** | Yes | Yes | Demo DB URL | Reports, Guardians, User Profile | **WORKING** | Firestore SDK with robust in-memory fallback repositories (`ReportRepository`, `UserRepository`). |
| **Firebase Cloud Messaging** | Partial | N/A | Server Key Required | Push Notifications | **PARTIALLY WORKING** | Dispatches push notifications via FCM SDK with fallback to web-push notification log. |
| **OpenAI API** | Optional | Yes | API Key Required | AI Assistant, Natural Language XAI | **WORKING (FALLBACK READY)** | `/api/v1/ai/chat/stream` streams responses when `OPENAI_API_KEY` is present; uses local spatial risk XAI engine when unconfigured. |
| **data.gov.in** | Yes | Yes | Public API | Crime Data Ingestion | **WORKING** | Fetches government crime stats; falls back to spatial density calculator if offline. |
| **Kaggle Crime CSV** | Yes | Yes | Local Dataset | Spatial Risk Engine | **WORKING** | Ingested into `backend/data/kaggle_crime_dataset.csv` for historical severity indexing. |

---

## 2. Backend Endpoint Verification Log

| Route Endpoint | Method | Response Code | Used By | Verification Status |
| :--- | :---: | :---: | :--- | :---: |
| `/api/v1/health` | `GET` | `200 OK` | System Health Monitoring | **VERIFIED (PASSED)** |
| `/api/v1/risk/evaluate` | `POST` | `200 OK` | Dashboard, Map, Risk Engine | **VERIFIED (PASSED)** |
| `/api/v1/routes/evaluate` | `POST` | `200 OK` | SafeRoute Navigation | **VERIFIED (PASSED)** |
| `/api/v1/reports` | `GET / POST` | `200 / 201` | Community Reports Page | **VERIFIED (PASSED)** |
| `/api/v1/guardians` | `GET / POST` | `200 / 201` | Guardian Circle Page | **VERIFIED (PASSED)** |
| `/api/v1/places/emergency-nearby` | `POST` | `200 OK` | Emergency Safe Havens Sheet | **VERIFIED (PASSED)** |
| `/api/v1/auth/me` | `GET` | `200 OK` | Auth Store & User Profile | **VERIFIED (PASSED)** |
| `/api/v1/auth/login` | `POST` | `200 OK` | Login Page | **VERIFIED (PASSED)** |
| `/api/v1/auth/signup` | `POST` | `201 Created` | Signup Page | **VERIFIED (PASSED)** |
| `/api/v1/emergency/trigger` | `POST` | `200 OK` | SOS Emergency Countdown | **VERIFIED (PASSED)** |
