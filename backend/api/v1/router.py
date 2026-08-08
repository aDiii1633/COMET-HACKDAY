from fastapi import APIRouter
from backend.api.v1.endpoints import (
    auth, profile, users, guardians, reports, risk, routes,
    notifications, health, places, maps, ai_summary, emergency,
    dashboard, admin, settings, crime
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(profile.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(guardians.router)
api_v1_router.include_router(reports.router)
api_v1_router.include_router(risk.router)
api_v1_router.include_router(routes.router)
api_v1_router.include_router(notifications.router)
api_v1_router.include_router(places.router)
api_v1_router.include_router(maps.router)
api_v1_router.include_router(ai_summary.router)
api_v1_router.include_router(emergency.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(admin.router)
api_v1_router.include_router(settings.router)
api_v1_router.include_router(crime.router)

