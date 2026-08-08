# SafeSphere AI — Product Requirements Document (PRD)

> **Document Version:** 1.0.0  
> **Status:** Approved / Production Specification  
> **Target Audience:** Engineering, Product, AI Research, UX Design, Hackathon Judges  
> **Core Slogan:** *Predict Danger Before It Happens.*

---

## 1. Vision & Mission

### 1.1 Vision
To eradicate spatial personal vulnerability by transforming static map navigation into an active, predictive AI safety shield that foresees threats before human exposure occurs.

### 1.2 Mission
SafeSphere AI replaces reactive emergency buttons (SOS) with continuous, spatial-temporal AI threat intelligence. By synthesizing community telemetry, real-time urban indicators, crowd dynamics, lighting metrics, and historical crime heatmaps, SafeSphere AI guides users through optimized low-risk routes, forecasts localized danger windows 30 to 60 minutes in advance, and provides context-aware automated protection via trusted Guardian networks.

---

## 2. Problem Statement & Market Opportunity

### 2.1 The Problem: The Reactive Safety Trap
Traditional personal safety applications operate on a **reactive paradigm**:
1. User enters a dangerous area or encounters a threat.
2. User experiences acute stress or physical distress.
3. User must unlock phone, locate app, and tap a SOS trigger button.
4. Alerts are sent *after* danger has manifested, giving responders zero lead time.

Furthermore, traditional navigation platforms (e.g., Google Maps, Waze, Apple Maps) optimize strictly for **time** or **distance**, frequently routing solo pedestrians through unlit alleys, deserted industrial parks, or high-crime micro-zones late at night.

### 2.2 Market Opportunity & Demographics
- **Primary Market:** Women’s personal safety & urban navigation globally.
- **Secondary Demographics:**
  - **Students:** Commuting across university campuses during late-night study hours.
  - **Night-Shift Workforce:** Healthcare staff, hospitality workers, tech/BPO workers finishing shifts between 10:00 PM and 5:00 AM.
  - **Solo Travelers & Tourists:** Navigating unfamiliar cities without intuitive knowledge of local danger spots.
  - **Daily Commuters:** Urban dwellers taking public transit, rideshare drop-offs, or walking home.

---

## 3. Target User Personas

### Persona 1: Ananya Sharma — Late-Shift Healthcare Professional (Primary)
- **Age:** 26  
- **Occupation:** Registered Nurse at Urban General Hospital  
- **Shift Schedule:** 7:00 PM – 3:30 AM  
- **Pain Points:** 
  - Walks 4 blocks from hospital exit to suburban transit station at 3:45 AM.
  - Standard maps suggest the shortest alley route behind closed commercial warehouses.
  - Terrified of sudden isolation; traditional panic apps require manual button presses that escalate tension.
- **Needs:** Proactive route recommendations that prioritize illumination and foot traffic, instant automatic guardian notifications without taking out her phone.

### Persona 2: Marcus Vance — University Student & Solo Commuter
- **Age:** 21  
- **Occupation:** Computer Science Undergraduate  
- **Lifestyle:** Navigates between campus libraries, off-campus housing, and late-night study groups.  
- **Pain Points:** 
  - Neighborhood dynamics change drastically between sunset (6:00 PM) and midnight.
  - Static ratings on review apps do not account for dynamic event crowds or sudden lighting power outages.
- **Needs:** Real-time predictive risk scoring that explains *why* a location is becoming unsafe over the next 45 minutes.

### Persona 3: Elena Rostova — Solo Traveler & Freelance Journalist
- **Age:** 31  
- **Lifestyle:** Travels solo across major metropolitan cities.  
- **Pain Points:** 
  - Lacks spatial memory and local intuition regarding neighborhood safety boundaries.
  - Unfamiliar with regional crime patterns or localized harassment hotspots.
- **Needs:** Transparent, explainable AI alerts that explain specific hazards (e.g., "High incidence of snatching, low streetlight coverage") and continuous background monitoring ("Safety Pulse").

---

## 4. Goals & Success Metrics

### 4.1 Quantitative Goals
- **Risk Avoidance Rate:** > 94% of user journeys completed through green/yellow risk zones.
- **Prediction Lead Time:** Warn users of escalating threat windows at least **15–30 minutes before** physical arrival.
- **Guardian Alert Velocity:** Dispatch rich contextual notifications to Guardian devices within **< 1.5 seconds** of safety threshold violation.
- **Navigation Efficiency Ratio:** Deliver routes that are safe with **< 12% distance penalty** compared to standard shortest path algorithms.

### 4.2 Qualitative Goals
- Eliminate anxiety during late-night commutes through ambient, non-intrusive haptic cues.
- Build radical trust via **Explainable AI (XAI)** — users must never see an unexplained black-box percentage score.
- Create a calm, ultra-premium user interface that feels reassuring rather than alarmist.

---

## 5. End-to-End User Journey

```
[ User Launches SafeSphere ] 
            │
            ▼
[ Input Destination or Enable Passive Safety Pulse ]
            │
            ▼
[ AI Risk Engine Synthesizes Spatial & Temporal Data ]
   ├── Community Telemetry & Verified Reports
   ├── Streetlight Illumination Grid
   ├── Historical Crime & Harassment Density
   └── Temporal Crowd Metrics (30-60m forecast)
            │
            ▼
[ AI SafeRoute Presents Multi-Tiered Paths ]
   ├── SafeRoute Alpha (Maximum Illumination & Foot Traffic)
   └── SafeRoute Balanced (Optimal Safety vs. Distance)
            │
            ▼
[ User Initiates Journey ]
            │
            ▼
[ AI Safety Pulse Active Background Tracking ]
   ├── Normal State: Low Haptic Pulse / Ambient Blue Glow
   └── Deviation / Approaching Danger Window Detected:
            │
            ├── Instant Haptic Patterns + Voice Warning
            ├── Proactive Reroute Overlay
            └── Automatic Guardian Circle Context Dispatch
                        │
                        ▼
            [ Guardian Receives Rich AI Context Card ]
            (Live Route + Historical Summary + XAI Rationale)
```

---

## 6. Complete Feature Specifications

### 6.1 AI SafeRoute (Predictive Spatial Routing)
- **Description:** Calculates navigation routes ranked by safety score rather than minimal distance.
- **Input Parameters:** Origin, Destination, Time of Day, Illumination Data, Community Incidents, Historical Crime Indices, Active Transport Mode (Pedestrian, Bike, Transit).
- **Behavior:**
  - Evaluates candidate paths generated by Mapbox / OpenStreetMap.
  - Divides routes into 50-meter spatial H3 hexagons.
  - Computes composite risk score $R_{zone}$ per spatial segment.
  - Renders visual route overlays: Safe (Emerald Green `#10B981`), Moderate (Amber `#F59E0B`), High Risk (Crimson `#EF4444`).

### 6.2 AI Future Risk Prediction (30–60 Minute Forecasting)
- **Description:** Spatial-temporal machine learning model that forecasts safety score degradation over the next 1 hour.
- **Example Scenario:**
  - At **10:00 PM**, a commercial marketplace has High Crowd, Bright Lighting → Risk Score: **14/100 (Safe)**.
  - At **10:45 PM**, stores close, crowd drops by 85%, transit stops close → Forecast Risk Score at 10:45 PM: **78/100 (High Danger)**.
- **User Interface:** Interactive timeline slider on route overview showing dynamic risk shifts per quarter-hour.

### 6.3 Explainable AI (XAI Safety Insights)
- **Description:** Natural Language generation layer powered by lightweight LLM / rule-synthesis engine that translates complex vectors into clear human-understandable points.
- **Standard UI Requirement:**
  - **Forbidden:** Raw un-explained numbers like `Risk: 82%`.
  - **Mandatory Specification:**
    - **Composite Risk Level:** High (82/100)
    - **Primary Drivers:**
      1. 14 verified harassment & mugging reports in past 30 days within 100m.
      2. Street Illumination Index: 12/100 (Unlit Alleyway).
      3. Pedestrian Density Index: 4/100 (Deserted Zone).
      4. Commercial Activity Closure: 100% closed after 10:00 PM.

### 6.4 AI Safety Pulse (Proactive Real-Time Monitoring)
- **Description:** Geofence and directional tracking engine running at 1Hz during active navigation.
- **Triggers:**
  - User approaches a predicted high-risk geofence within 150 meters.
  - User stops moving unexpectedly in a low-safety zone for > 180 seconds.
  - User deviates significantly from the approved SafeRoute into an unverified zone.
- **System Actions:**
  - **Level 1 (Warning):** Custom double-haptic vibration pattern + soft audio prompt ("SafeSphere alert: High-risk zone ahead in 100m. Tap to reroute.").
  - **Level 2 (Critical Escalation):** Visual full-screen high-contrast overlay with 15-second countdown timer before Guardian Circle auto-dispatch.

### 6.5 AI Guardian Circle (Contextual Emergency Intelligence)
- **Description:** Automated, rich context broadcast engine to user-designated trusted contacts (Family, Friends, Roommates).
- **Trigger Conditions:**
  - Automatic dispatch upon entering Level 2 Danger Zone without user cancellation.
  - Manual panic trigger / Shake-to-Alert.
  - Prolonged route failure (loss of GPS trajectory in high-risk zone).
- **Guardian Notification Payload (Data & UI):**
  - **Title:** `[SafeSphere Alert] Ananya has entered a High Risk Area`
  - **User Context:** Name, Phone Number, Battery %, Movement Speed, Direction.
  - **Live Geolocation Link:** End-to-end encrypted WebRTC/Firestore live tracking map.
  - **XAI Threat Summary:** "Ananya deviated onto 4th Street Alley at 11:14 PM. Area has 8 reported late-night incidents and 0 active streetlights."
  - **Action Options for Guardian:** One-tap direct call, trip tracking view, localized emergency service trigger.

---

## 7. Functional & Non-Functional Requirements

### 7.1 Functional Requirements (FR)
- **FR-01:** System must allow users to register up to 10 Guardians with verified SMS / Push token channels.
- **FR-02:** System must compute and display at least 2 alternate routes (Safest vs Fast-Balanced) with safety scores.
- **FR-03:** System must allow community incident reporting (Lighting failure, Verbal harassment, Suspicious activity, Physical assault) with spatial tagging.
- **FR-04:** System must execute background location tracking with low power consumption.
- **FR-05:** System must deliver real-time guardian updates even under degraded 3G network conditions using lightweight JSON payloads over WebSockets/Firestore.

### 7.2 Non-Functional Requirements (NFR)
- **NFR-01 Performance:** Route risk calculation must respond within `< 450ms` for a 15km path.
- **NFR-02 Availability:** Backend spatial risk services must maintain 99.9% uptime.
- **NFR-03 Latency:** Real-time location sync to Guardians must achieve `< 1000ms` end-to-end latency.
- **NFR-04 Privacy & Security:** Geolocation data must be encrypted in transit (TLS 1.3) and at rest (AES-256). User identity in community reports must be anonymized with spatial jittering (50m random offset).
- **NFR-05 Battery Efficiency:** Background Safety Pulse tracking must consume `< 3.5%` battery per hour.

---

## 8. Hackathon Demo Flow & Elevator Pitch

### 8.1 Elevator Pitch (30 Seconds)
> "Every safety app on the market today makes the same fatal mistake: they wait for a crime to happen before asking the victim to hit an SOS button. **SafeSphere AI changes the paradigm from reaction to prevention.** By synthesizing spatial lighting, community telemetry, historical crime patterns, and predictive crowd density, our Explainable AI reroutes users around danger *before* they enter it, and automatically keeps trusted guardians informed with rich, real-time context. SafeSphere AI: Predict danger before it happens."

### 8.2 Live 3-Minute Demo Sequence
1. **0:00 - 0:30 (The Contrast):** Show standard map routing a solo pedestrian down a dark alley at 11:30 PM vs SafeSphere AI calculating **SafeRoute Alpha** with green illuminated corridors.
2. **0:30 - 1:15 (Future Risk & XAI):** Drag the **Future Risk Slider** to 12:15 AM. Watch the market zone turn from Green to Red. Tap the zone to reveal **Explainable AI cards** ("Crowd drops 90%, lighting index 15/100").
3. **1:15 - 2:15 (Safety Pulse & Guardian Circle):** Simulate walking towards the danger zone. **AI Safety Pulse** triggers tactile haptics + popup. Simulate ignoring the warning. Automatically, the **Guardian Device** receives a push notification with live tracking, battery stats, and XAI incident summary.
4. **2:15 - 3:00 (Community Telemetry & Closing):** Submit a 1-tap micro-report ("Lighting broken"). Watch the risk map update instantaneously in real-time. End on pitch summary.
