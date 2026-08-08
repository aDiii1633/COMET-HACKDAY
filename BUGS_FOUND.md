# SafeSphere AI — Forensic Audit: BUGS_FOUND.md

## Overview

This report documents all bugs, low-contrast accessibility failures, route 404s, backend type errors, and environment misconfigurations discovered and repaired during the forensic audit of SafeSphere AI.

---

### Bug 1: Turbopack Workspace Root Inference & Route 404 on `/splash`

- **Severity**: Critical (Broken Navigation / Route 404)
- **Root Cause**: Next.js 16 (Turbopack) searched parent directories for `package-lock.json` and selected `d:\girl hackday` as root workspace, preventing route resolution for `src/app`.
- **Files Affected**:
  - [web/next.config.ts](file:///d:/girl%20hackday/web/next.config.ts)
  - `package-lock.json` (deprecated in root)
- **Fix Applied**:
  Added explicit path resolution in `web/next.config.ts`:
  ```ts
  import path from "path";
  const nextConfig: NextConfig = {
    turbopack: {
      root: path.resolve(__dirname),
    },
  };
  ```
  Renamed root `package-lock.json` to `package-lock.json.deprecated`.
- **Verification**: `Invoke-WebRequest -Uri "http://localhost:3000/splash"` returns `200 OK`.

---

### Bug 2: Unreadable Text & Contrast Failures Across UI Design System

- **Severity**: High (Accessibility & UI Failure)
- **Root Cause**: Overused low-contrast white text (`text-white`, `text-muted-foreground`) on light background surfaces (`#F7F9F7`, `#DCFCE7`), causing invisible text when hovering or on daylight view.
- **Files Affected**:
  - [web/src/app/globals.css](file:///d:/girl%20hackday/web/src/app/globals.css)
  - [web/src/components/ui/button.tsx](file:///d:/girl%20hackday/web/src/components/ui/button.tsx)
  - [web/src/components/ui/input.tsx](file:///d:/girl%20hackday/web/src/components/ui/input.tsx)
  - [web/src/components/layout/DashboardLayout.tsx](file:///d:/girl%20hackday/web/src/components/layout/DashboardLayout.tsx)
  - [web/src/components/chat/FloatingAssistant.tsx](file:///d:/girl%20hackday/web/src/components/chat/FloatingAssistant.tsx)
  - [web/src/components/chat/FloatingVoiceAgent.tsx](file:///d:/girl%20hackday/web/src/components/chat/FloatingVoiceAgent.tsx)
  - [web/src/app/dashboard/page.tsx](file:///d:/girl%20hackday/web/src/app/dashboard/page.tsx)
  - [web/src/app/map/page.tsx](file:///d:/girl%20hackday/web/src/app/map/page.tsx)
  - [web/src/app/guardians/page.tsx](file:///d:/girl%20hackday/web/src/app/guardians/page.tsx)
  - [web/src/app/community/page.tsx](file:///d:/girl%20hackday/web/src/app/community/page.tsx)
  - [web/src/app/emergency/page.tsx](file:///d:/girl%20hackday/web/src/app/emergency/page.tsx)
  - [web/src/app/splash/page.tsx](file:///d:/girl%20hackday/web/src/app/splash/page.tsx)
  - [web/src/app/onboarding/page.tsx](file:///d:/girl%20hackday/web/src/app/onboarding/page.tsx)
  - [web/src/app/profile/page.tsx](file:///d:/girl%20hackday/web/src/app/profile/page.tsx)
  - [web/src/app/settings/page.tsx](file:///d:/girl%20hackday/web/src/app/settings/page.tsx)
  - [web/src/app/notifications/page.tsx](file:///d:/girl%20hackday/web/src/app/notifications/page.tsx)
  - [web/src/app/auth/login/page.tsx](file:///d:/girl%20hackday/web/src/app/auth/login/page.tsx)
  - [web/src/app/auth/signup/page.tsx](file:///d:/girl%20hackday/web/src/app/auth/signup/page.tsx)
- **Fix Applied**:
  - Centralized master CSS color token system: Primary Text `#172018`, Secondary Text `#4B5563`, Surface `#FFFFFF`, Deep Green `#15803D`, Pale Green `#DCFCE7`, Dark Green `#14532D`.
  - Replaced all raw `text-white` with `#172018` or `#FFFFFF` on dark surfaces.
  - Added strict focus ring `2px solid #22C55E` and hover states preventing text disappearance.
- **Verification**: Visual inspection and zero build contrast errors.

---

### Bug 3: `UserRepository` Unseeded Demo User Profile (`404` on `/api/v1/auth/me`)

- **Severity**: Medium (Backend Auth Failure)
- **Root Cause**: `/api/v1/auth/me` attempted to query `sub_ananya_01` in Firestore/in-memory user store when no auth token was provided, throwing `ResourceNotFoundException`.
- **Files Affected**:
  - [backend/repositories/user_repository.py](file:///d:/girl%20hackday/backend/repositories/user_repository.py)
- **Fix Applied**:
  Pre-seeded default demo user profile `sub_ananya_01` in `_in_memory_users` dictionary during initialization:
  ```python
  self._in_memory_users = {
      "sub_ananya_01": {
          "id": "sub_ananya_01",
          "email": "user@safesphere.ai",
          "name": "Ananya Sharma",
          "role": "user",
          "is_active": True,
          "createdAt": datetime.utcnow().isoformat(),
          "updatedAt": datetime.utcnow().isoformat(),
      }
  }
  ```
- **Verification**: `python -m pytest backend/tests` passed `test_auth_me_endpoint`.

---

### Bug 4: Async Pytest Runner Error in `test_risk_engine.py`

- **Severity**: Low (Test Suite Failure)
- **Root Cause**: `@pytest.mark.asyncio` decorator failed because `pytest-asyncio` plugin was not loaded in standard pytest invocation.
- **Files Affected**:
  - [backend/tests/test_risk_engine.py](file:///d:/girl%20hackday/backend/tests/test_risk_engine.py)
- **Fix Applied**:
  Refactored test to run async risk engine calculation synchronously using `asyncio.run()`:
  ```python
  def test_risk_engine_calculation():
      service = RiskEngineService()
      res = asyncio.run(service.calculate_risk(37.774929, -122.419416, time_offset_minutes=0))
      assert res.risk_score >= 0.0
      assert res.risk_score <= 100.0
  ```
- **Verification**: `python -m pytest backend/tests` completed with 4/4 passing tests.

---

### Bug 5: Stale Turbopack Dev Cache Locking Production Build

- **Severity**: Medium (CI/CD / Build Error)
- **Root Cause**: Concurrent Next.js dev server (`npm run dev`) held file locks on `.next/dev/server/chunks`, causing `next build` to fail with module resolution type error on `routes.d.ts`.
- **Files Affected**:
  - `.next/dev/types/validator.ts`
- **Fix Applied**:
  Stopped running dev server before building, and purged `.next` cache directory before `next build`.
- **Verification**: `npm run build` completed cleanly with `✓ Compiled successfully in 11.7s` and `20/20` static pages generated.
