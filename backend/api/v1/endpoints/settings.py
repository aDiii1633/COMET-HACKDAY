from typing import Dict, Any
from fastapi import APIRouter, Depends
from backend.repositories.admin_repository import AdminRepository

router = APIRouter(prefix="/settings", tags=["System Settings"])


def get_admin_repository() -> AdminRepository:
    return AdminRepository()


@router.get("/system", response_model=Dict[str, Any])
async def get_system_settings(
    admin_repo: AdminRepository = Depends(get_admin_repository)
):
    """Fetches global system configuration thresholds from Firestore /Settings."""
    return await admin_repo.get_settings()


@router.put("/system", response_model=Dict[str, Any])
async def update_system_settings(
    new_settings: Dict[str, Any],
    admin_repo: AdminRepository = Depends(get_admin_repository)
):
    """Updates global system configuration thresholds."""
    return await admin_repo.update_settings(new_settings)
