# SafeSphere AI — Development & Engineering Rules

> **Document Version:** 1.0.0  
> **Status:** Active Enforcement  
> **Target Audience:** All AI Coding Agents, Software Engineers, Code Reviewers

---

## 1. Core Principles & Philosophy
Every line of code written for SafeSphere AI must strictly obey three non-negotiable principles:
1. **Safety First, Speed Second:** Code must never silently swallow errors, drop emergency notifications, or present outdated risk scores without explicit degraded status UI.
2. **Zero Black Boxes:** Every calculated risk score must be paired with an Explainable AI (XAI) rationale data structure.
3. **Tactile Premium Elegance:** UI components must follow the Dark Premium Glassmorphism guidelines. No generic unstyled HTML controls.

---

## 2. Mandatory Rules by Category

### 2.1 Coding & Syntax Rules
- **RULE-01:** Standard JS/JSX code must pass ESLint cleanly with 0 warnings or errors under ES2024 standards.
- **RULE-02:** Never use `any` type (in TypeScript) or unvalidated input parameters. All API inputs must be validated with Zod schemas.
- **RULE-03:** Immutable state updates only. Direct mutation of Zustand global store objects or React state is strictly forbidden.
- **RULE-04:** Use async/await for asynchronous operations. Bare `.then()` and `.catch()` chains are disallowed except inside specialized streaming handlers.

### 2.2 Naming Conventions
- **RULE-05 Components:** PascalCase for React component files and exports (e.g., `SafeRouteCard.jsx`, `GuardianStatusBadge.jsx`).
- **RULE-06 Hooks & Utilities:** camelCase prefixed with `use` for hooks (e.g., `useSafetyPulse.js`) and descriptive verbs for utilities (e.g., `calculateH3RiskIndex.js`).
- **RULE-07 Constants & Tokens:** UPPER_SNAKE_CASE for environment variables, config constants, and fixed risk thresholds (e.g., `MAX_RISK_THRESHOLD_HIGH = 75`).
- **RULE-08 CSS Classes:** Tailwind v4 utility classes combined with semantic BEM or CSS modules for custom glassmorphism styles (e.g., `glass-card-dark`).

### 2.3 Directory & Folder Discipline
- **RULE-09:** Component files MUST reside strictly within their assigned feature folder inside `src/components/` (e.g., `src/components/map/` or `src/components/pulse/`). No orphaned components in root directories.
- **RULE-10:** Shared UI components (Buttons, Inputs, Cards) MUST be completely decoupled from domain business logic and consume props cleanly.

### 2.4 Component Architecture Rules
- **RULE-11 Functional Single Responsibility:** No component file may exceed 250 lines of code. If a component exceeds 250 lines, refactor into sub-components.
- **RULE-12 Prop Types & Validation:** All React component props must be explicitly documented or validated.
- **RULE-13 Memoization:** Map rendering components and high-frequency risk score badges must be wrapped in `React.memo` or use `useMemo`/`useCallback` to prevent unnecessary main-thread re-renders during 1Hz location updates.

### 2.5 UI & Styling Rules
- **RULE-14 Color Palette Enforcement:**
  - Dark OLED Background: `#050507` (Strict background base).
  - Safe Route / Low Risk: Emerald `#10B981`.
  - Warning / Moderate Risk: Amber `#F59E0B`.
  - Critical Danger / High Risk: Crimson `#EF4444`.
  - Brand Accent Glow: Deep Indigo / Violet `#6366F1`.
- **RULE-15 Glassmorphism Tokens:** Glass cards must use `backdrop-filter: blur(16px)` with `background: rgba(18, 18, 24, 0.65)` and `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **RULE-16 Responsive Target:** Mobile-first layout optimized for minimum screen width `360px` up to `430px` viewport baseline.

### 2.6 Motion & Animation Rules
- **RULE-17 Framer Motion Standards:** Use spring physics (`stiffness: 300, damping: 25`) for tactile UI element transitions.
- **RULE-18 Micro-Interactions:** Buttons must provide immediate physical feel (`whileTap={{ scale: 0.96 }}`).
- **RULE-19 Emergency Pulse Effect:** Critical alerts must render smooth, non-flashing radial CSS pulse animations to avoid visual disorientation.

### 2.7 Accessibility Rules (WCAG 2.1 AA)
- **RULE-20 Contrast Minimums:** Text overlaying dark glass cards must maintain at least a 4.5:1 contrast ratio.
- **RULE-21 Screen Reader Support:** All interactive elements (`<button>`, inputs, map markers) MUST include descriptive `aria-label` attributes.
- **RULE-22 Haptic Fallbacks:** Visual alerts must accompany haptic vibration calls (`navigator.vibrate`) for users with haptic disabled or desktop clients.

### 2.8 AI Inference & Fallback Rules
- **RULE-23 Offline Fallback:** If spatial risk prediction microservice fails or loses network connectivity, the system MUST fallback to cached local H3 risk indices and notify the user with a degraded status indicator (`"Cached Risk Data Active"`).
- **RULE-24 Timeout Threshold:** AI XAI natural language calls must have a strict timeout of `800ms`. If exceeded, present pre-compiled deterministic explanation templates without blocking navigation rendering.

### 2.9 Error Handling Rules
- **RULE-25 Catch & Log:** All try/catch blocks must send structured log payloads to the logging system. Silent empty catch blocks `try {} catch (e) {}` are forbidden.
- **RULE-26 User Feedback:** Unhandled application errors must display a friendly dark-mode toast notification with retry capability.

### 2.10 Security & Privacy Rules
- **RULE-27 Zero Plaintext Location Storage:** Geolocation data stored in permanent databases must be rounded to 4 decimal places (~11 meters) or indexed into H3 hexes to protect granular home privacy.
- **RULE-28 Environment Variables:** API Keys (Mapbox, Gemini, Firebase config) MUST be loaded strictly via `import.meta.env` variables and NEVER hardcoded in client source code.

### 2.11 Firebase & Realtime Rules
- **RULE-29 Listener Unsubscribe:** All Firebase Realtime DB and Firestore listeners (`onSnapshot`, `onValue`) MUST be cleanly unsubscribed in the cleanup function of React `useEffect` hooks.
- **RULE-30 Row-Level Security Rules:** Firestore and RTDB security rules must explicitly restrict read access to `/journeys/{journeyId}` strictly to authenticated user UID or approved Guardian UIDs.

### 2.12 Mapbox & Geospatial Rules
- **RULE-31 WebGL Context Protection:** Re-instantiating the Mapbox GL instance on every render cycle is forbidden. Maintain a single ref (`mapRef.current`) across the view lifecycle.
- **RULE-32 Vector Layer Optimization:** Render H3 risk hexagons and SafeRoute paths using native Mapbox vector tile sources or `GeoJSONSource.setData()` updates rather than individual DOM React markers.

### 2.13 Notification Rules
- **RULE-33 High Priority Channel:** Mobile FCM push notifications sent during Level 2 safety alerts MUST be configured with `priority: "high"` and `android.notification.channel_id: "safety_alerts_channel"`.
- **RULE-34 Actionable Payload:** Every push notification payload MUST contain deep-link URLs to immediately launch the Guardian Live Tracking view (`/track/:journeyId`).
