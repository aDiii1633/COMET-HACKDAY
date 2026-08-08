# Android Architecture & System Integration

SafeSphere AI is designed with an API-first approach, meaning the current backend is fully prepared to serve a native Android application without any architectural changes.

## 1. Floating Safety Bubble (SYSTEM_ALERT_WINDOW)
The Android native app will utilize the `SYSTEM_ALERT_WINDOW` permission to render a floating bubble overlay over other apps, ensuring the user always has immediate access to safety features even when the app is minimized.

### Radial Menu Actions & API Mapping
When the bubble is tapped, a radial menu expands. Here is how each native action maps to the existing FastAPI backend:

1. **🚨 Emergency SOS**
   - **Trigger:** Tapping the SOS icon.
   - **Backend API:** `POST /api/v1/emergency/trigger`
   - **Behavior:** Bypasses the 15-second countdown and instantly dispatches high-priority Firebase Cloud Messaging (FCM) pushes and SMS alerts to the Guardian Circle.

2. **🗺 Safe Route Home**
   - **Trigger:** Tapping the Map icon.
   - **Backend API:** `POST /api/v1/routes/calculate` & `POST /api/v1/routes/start-journey`
   - **Behavior:** The native app fetches the user's home coordinate from the Supabase profile, requests the Safest Route, and starts the journey broadcast.

3. **📍 Share Live Location**
   - **Trigger:** Tapping the Location Share icon.
   - **Backend API:** Uses Firestore Realtime listeners on the `/live_tracking/{user_id}` document.
   - **Behavior:** Activates a background Foreground Service (`Service`) with `ACCESS_FINE_LOCATION` to stream coordinates at 5-second intervals.

4. **👨‍👩‍👧 Notify Guardian**
   - **Trigger:** Tapping the Guardian icon.
   - **Backend API:** `POST /api/v1/guardians/notify`
   - **Behavior:** Sends a Level 1 (Low Urgency) check-in notification to Guardians ("I'm okay, just checking in").

5. **🤖 AI Safety Assistant**
   - **Trigger:** Tapping the AI icon.
   - **Backend API:** `POST /api/v1/ai/chat`
   - **Behavior:** Opens a native BottomSheet dialog that connects to the same OpenAI-powered intelligence layer used by the web app.

## 2. Background Services
- **Risk Engine Polling:** The app will use `WorkManager` to periodically ping the `/api/v1/risk/evaluate` endpoint.
- **Haptic Warnings:** If the returned risk score crosses the `DANGER` threshold (e.g., >70), the app triggers the device Vibrator (`VibrationEffect`) to alert the user even if the phone is in their pocket.

## 3. Tech Stack Requirements
- **Language:** Kotlin
- **Architecture:** MVVM with Clean Architecture
- **Networking:** Retrofit + OkHttp
- **Push Notifications:** Firebase Cloud Messaging (FCM) SDK
- **Maps:** Google Maps SDK for Android
- **Auth:** Supabase Kotlin SDK
