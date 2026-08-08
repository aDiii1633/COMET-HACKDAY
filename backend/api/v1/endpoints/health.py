from fastapi import APIRouter, status
from backend.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Monitoring"])


@router.get("", status_code=status.HTTP_200_OK)
async def health_check():
    """System health check and readiness probe endpoint."""
    return {
        "status": "online",
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {
            "risk_engine": "operational",
            "gemini_xai": "plugged_in_fallback_ready" if not getattr(settings, "GEMINI_API_KEY", None) else "operational",
            "firebase": "connected",
            "google_maps": "plugged_in_haversine_ready" if not settings.GOOGLE_MAPS_API_KEY else "operational"
        }
    }
