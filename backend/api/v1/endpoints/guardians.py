from typing import List
from fastapi import APIRouter, Depends, status
from backend.schemas.guardian import GuardianCreateRequest, GuardianResponse, GuardianAlertPayload
from backend.services.guardian_service import GuardianService
from backend.core.dependencies import get_guardian_service, get_current_user_uid

router = APIRouter(prefix="/guardians", tags=["Guardian Circle"])


@router.get("", response_model=List[GuardianResponse])
async def list_guardians(
    user_uid: str = Depends(get_current_user_uid),
    guardian_service: GuardianService = Depends(get_guardian_service)
):
    return await guardian_service.get_user_guardians(user_uid)


@router.post("", response_model=GuardianResponse, status_code=status.HTTP_201_CREATED)
async def add_guardian(
    request: GuardianCreateRequest,
    user_uid: str = Depends(get_current_user_uid),
    guardian_service: GuardianService = Depends(get_guardian_service)
):
    return await guardian_service.add_guardian(user_uid, request)


@router.post("/alert", response_model=GuardianAlertPayload)
async def trigger_guardian_alert(
    latitude: float = 37.776500,
    longitude: float = -122.416200,
    risk_score: float = 78.0,
    user_uid: str = Depends(get_current_user_uid),
    guardian_service: GuardianService = Depends(get_guardian_service)
):
    """Triggers automated Level 2 emergency dispatch with AI Context Card payload."""
    return await guardian_service.generate_emergency_alert(
        user_uid=user_uid,
        current_lat=latitude,
        current_lng=longitude,
        risk_score=risk_score
    )
