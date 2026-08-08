# SafeSphere AI — Forensic Audit: TECHNICAL_DEBT.md

## Overview

This document tracks items intentionally preserved, architectural recommendations, and external cloud provider configurations required for production deployment.

---

## 1. External Cloud Provider Configurations (Action Items for Production Deployment)

1. **Google Maps API Billing & Restrictions**:
   - Ensure `GOOGLE_MAPS_API_KEY` has *Maps JavaScript API*, *Directions API*, and *Places API (New)* enabled in Google Cloud Console.
   - Restrict referrer domains in production to `https://safesphere.ai/*`.

2. **Supabase Authentication Policies**:
   - Configure custom SMTP server in Supabase Auth settings to enable real password reset emails (`/auth/forgot-password`).
   - Enable Row Level Security (RLS) policies on `users` table for custom tenant isolation.

3. **Firebase Cloud Messaging Service Account Key**:
   - For real mobile push notifications on Android/iOS, supply `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` in `backend/.env`.

4. **OpenAI API Key & Quota**:
   - Supply valid `OPENAI_API_KEY` in `backend/.env` to enable real-time GPT-4o natural language responses on `/api/v1/ai/chat/stream`.

---

## 2. Codebase Refactoring & Optimization Recommendations

1. **FastAPI Lifespan Event Handler Upgrade**:
   - Replaced deprecated `@app.on_event("startup")` with FastAPI `lifespan` context manager in future major release.

2. **UTC Datetime Deprecation Migration**:
   - Update `datetime.utcnow()` references to `datetime.now(timezone.utc)` for Python 3.14 compatibility.

3. **Service Worker Push Notification Listener**:
   - Register `/sw.js` browser service worker for background FCM push notification popups when app tab is closed.
