# SafeSphere AI — Execution Roadmap & Phases

> **Document Version:** 1.0.0  
> **Status:** Production Delivery Roadmap  
> **Target Audience:** Engineering Leads, Project Managers, AI Developers, Hackathon Team

---

## Roadmap Overview

SafeSphere AI is structured into **5 distinct execution phases** tailored for rapid, high-quality development, seamless feature integration, and hackathon presentation readiness.

```
┌────────────────────────────────────────────────────────┐
│ Phase 0: Project Setup & Core Foundation               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 1: Spatial Risk Engine & Map Integration         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 2: SafeRoute & Guardian Circle Infrastructure    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 3: AI Safety Pulse & Explainable AI (XAI)        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ Phase 4: UI/UX Polish, Testing & Hackathon Demo        │
└────────────────────────────────────────────────────────┘
```

---

## Phase 0: Setup, Design Tokens & Core Infrastructure

- **Objective:** Establish repository structure, design system tokens, Firebase configuration, and Mapbox container foundation.
- **Priority:** Critical (P0)
- **Estimated Duration:** 4 Hours
- **Dependencies:** None

### Deliverables:
1. React 18 + Vite repository initialized with Tailwind CSS v4 and glassmorphism styling modules.
2. Firebase Authentication, Firestore, and Realtime Database project initialized with security rules.
3. Mapbox GL JS map engine wrapper component rendering dark OLED map vector tile style.
4. Core Zustand stores (`useUserStore`, `useRouteStore`, `useSafetyStore`).

### Milestones:
- [x] Repository created with standardized directory layout.
- [x] Web app boots on `http://localhost:5173` with zero console errors.
- [x] Dark glassmorphism card component rendering with blur effects.

### Risks & Mitigations:
- *Risk:* Mapbox access token exposure.  
  *Mitigation:* Restrict domain access in Mapbox API dashboard and load strictly via `.env`.

---

## Phase 1: Spatial Risk Engine & Community Telemetry

- **Objective:** Implement the spatial H3 geospatial indexing system, community report submission pipeline, and risk map visualization layer.
- **Priority:** Critical (P0)
- **Estimated Duration:** 8 Hours
- **Dependencies:** Phase 0 completion

### Deliverables:
1. `riskEngine.js` calculating spatial risk score $R(s, t)$ using spatial decay kernels.
2. H3 Resolution 8 & 9 vector polygon rendering layer over Mapbox map.
3. Community Incident submission modal with spatial category selection (Lighting, Harassment, Crowd, Suspicious).
4. Firestore `community_reports` realtime listener updating local spatial risk indices dynamically.

### Milestones:
- [ ] Map renders color-coded H3 risk hexagons (Green/Amber/Red) according to simulated and live risk data.
- [ ] Submitting a community incident instantaneously changes the color of the target H3 hexagon from Green to Amber/Red.

### Completion Checklist:
- [ ] H3 conversion functions (`latLngToCell`, `cellToBoundary`) tested and verified.
- [ ] Community report submission modal fully accessible with dark theme.

---

## Phase 2: AI SafeRoute Engine & Guardian Circle Setup

- **Objective:** Build predictive multi-route scoring algorithm and real-time Guardian Circle telemetry dispatch.
- **Priority:** Critical (P0)
- **Estimated Duration:** 10 Hours
- **Dependencies:** Phase 1 completion

### Deliverables:
1. `useSafeRoute` hook generating Safest vs Fast-Balanced navigation routes.
2. Future Risk Timeline Slider (0 to 60 minutes) forecasting dynamic risk score changes per quarter hour.
3. Guardian Management UI allowing addition and management of trusted contacts.
4. Firebase Realtime DB streaming trajectory node (`/journeys/{journeyId}/location`).

### Milestones:
- [ ] Inputting origin and destination renders 2 alternative paths with safety scores.
- [ ] Dragging the Future Risk Slider dynamically updates route segment risk overlays based on forecasted crowd/lighting drop-offs.
- [ ] Adding a Guardian creates a persistent contact record in user profile.

### Completion Checklist:
- [ ] SafeRoute algorithm successfully favors well-lit main avenues over shortcut alleyways.
- [ ] Realtime DB updates live coordinate data at 1Hz without causing React rendering lag.

---

## Phase 3: AI Safety Pulse & Explainable AI (XAI) Layer

- **Objective:** Deploy proactive background location monitoring, haptic escalation alert system, and Gemini-powered Explainable AI cards.
- **Priority:** Critical (P0)
- **Estimated Duration:** 8 Hours
- **Dependencies:** Phase 2 completion

### Deliverables:
1. `useSafetyPulse` hook evaluating geofence risk proximity during active navigation.
2. Escalation Modal with 15-second countdown timer, haptic vibration patterns, and manual override.
3. Automated Guardian Alert Dispatch Cloud Function compiling XAI payload upon timer expiration.
4. XAI Threat Card component displaying plain-language risk breakdown (e.g., "12 harassment reports, 15% illumination").

### Milestones:
- [ ] Simulating movement toward a Red H3 hexagon triggers Level 1 haptic warning.
- [ ] Entering a High Risk zone triggers 15-second countdown modal.
- [ ] Letting timer expire fires automated FCM push payload to Guardian device with live web link.
- [ ] Tapping any route segment opens Gemini XAI explanation card.

### Completion Checklist:
- [ ] Haptic vibration patterns function correctly on mobile Chrome/Safari browsers.
- [ ] Guardian live tracking web view accurately displays real-time position of test journey.

---

## Phase 4: Design Polish, Testing & Hackathon Pitch Readiness

- **Objective:** Refine dark glassmorphism visual presentation, optimize frame rates (60 FPS), conduct end-to-end user testing, and rehearse live demo.
- **Priority:** High (P1)
- **Estimated Duration:** 6 Hours
- **Dependencies:** Phase 3 completion

### Deliverables:
1. Framer Motion transition animations for all page and modal transitions.
2. Responsive touch layout validation across iPhone 15 Pro, Pixel 8, and Galaxy S24 viewports.
3. End-to-end demo script execution with zero failure points.
4. Deployment to production Vercel/Firebase Hosting URL.

### Milestones:
- [ ] Production build (`npm run build`) compiles with zero warnings or bundle size warnings.
- [ ] Production application accessible live on HTTPS custom domain.
- [ ] 3-minute hackathon pitch and live demonstration executed within strict time constraints.

### Completion Checklist:
- [ ] Audit zero generic text or placeholders across entire application.
- [ ] Verify light/dark theme contrast compliance.
