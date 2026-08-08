# SafeSphere AI

<p align="center">
  <em>Predict Danger Before It Happens.</em>
</p>

## Overview

SafeSphere AI is an AI-powered Women Safety and Community Intelligence Platform that transforms static map navigation into an active, predictive AI safety shield. It foresees threats before human exposure occurs.

Unlike traditional reactive emergency buttons (SOS), SafeSphere AI offers continuous, spatial-temporal AI threat intelligence. By synthesizing community telemetry, real-time urban indicators, crowd dynamics, lighting metrics, and historical crime heatmaps, SafeSphere AI guides users through optimized low-risk routes, forecasts localized danger windows, and provides context-aware automated protection via trusted Guardian networks.

## Features

- **AI SafeRoute (Predictive Spatial Routing):** Calculates navigation routes ranked by safety score rather than minimal distance. Prioritizes maximum illumination and foot traffic.
- **AI Future Risk Prediction:** Spatial-temporal forecasting models that predict safety score degradation over time.
- **Explainable AI (XAI Safety Insights):** Translates complex threat vectors into clear, human-understandable points. Never rely on an unexplained black-box percentage score.
- **AI Safety Pulse:** Proactive background monitoring that alerts users if they deviate into a high-risk area.
- **AI Guardian Circle:** Automated rich-context broadcasting to trusted contacts when danger is imminent, including live WebRTC location tracking and AI threat summaries.

## Tech Stack

### Frontend (Web)
- **Next.js 15 (App Router)** - React Framework for web and mobile-responsive PWA.
- **Tailwind CSS & shadcn/ui** - Styling and UI components with a custom high-contrast dark theme.
- **Zustand** - Client-side state management.
- **React Query** - API caching and synchronization.
- **Google Maps API** - Map rendering and geolocation.

### Backend (API)
- **FastAPI (Python)** - High-performance asynchronous API backend.
- **Pydantic** - Data validation and settings management.
- **Google Gemini & OpenAI** - Multi-model AI processing for natural language threat explainability and risk summaries.
- **Supabase / PostgreSQL (Architected)** - For robust relational data.
- **Firebase / Firestore** - Real-time tracking and Guardian Circle updates.

## Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or newer)
- Python 3.10+
- Google Maps API Key
- Gemini / OpenAI API Keys (for XAI features)

### 1. Clone the repository

```bash
git clone https://github.com/aDiii1633/COMET-A.git
cd COMET-A
```

### 2. Setup the Backend (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env based on the template
cp .env.example .env
# Fill in your API keys in the .env file

# Run the backend
python run_backend.py
```

The backend API will be available at `http://localhost:8000`. API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### 3. Setup the Frontend (Next.js)

```bash
# Open a new terminal and navigate to the web directory
cd web

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_ API keys

# Run the development server
npm run dev
```

The web application will be available at `http://localhost:3000`.

## Testing

The project includes an extensive test suite for the Python backend.

```bash
cd backend
pytest -v
```

## Production Deployment Readiness

This repository is structured for seamless CI/CD and deployment:
- **Backend:** Ready for deployment to platforms like Render, Railway, or AWS App Runner via Docker or direct Python ASGI execution.
- **Frontend:** Fully optimized Next.js setup ready for deployment on Vercel.

## Security

**Do not commit API keys or `.env` files to version control.** A robust `.gitignore` is in place. If you discover a vulnerability, please report it privately rather than creating a public issue.

## License

This project is licensed under the MIT License.
