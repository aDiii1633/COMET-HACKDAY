import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from backend.schemas.guardian import GuardianAlertPayload
from backend.services.guardian_service import GuardianService
from backend.repositories.emergency_repository import EmergencyRepository
from backend.core.dependencies import get_guardian_service, get_current_user_uid

router = APIRouter(prefix="/emergency", tags=["Emergency Engine"])


def get_emergency_repository() -> EmergencyRepository:
    return EmergencyRepository()


@router.post("/trigger", response_model=GuardianAlertPayload, status_code=status.HTTP_201_CREATED)
async def trigger_emergency_alert(
    latitude: float = 37.776500,
    longitude: float = -122.416200,
    risk_score: float = 78.0,
    user_uid: str = Depends(get_current_user_uid),
    guardian_service: GuardianService = Depends(get_guardian_service),
    emergency_repo: EmergencyRepository = Depends(get_emergency_repository)
):
    """Triggers high-urgency Level 2 Emergency Alert & logs to Firestore /EmergencyLogs."""
    alert_payload = await guardian_service.generate_emergency_alert(
        user_uid=user_uid,
        current_lat=latitude,
        current_lng=longitude,
        risk_score=risk_score
    )

    # Persist log to Firestore /EmergencyLogs
    log_id = f"emg_log_{uuid.uuid4().hex[:8]}"
    await emergency_repo.create(log_id, {
        "log_id": log_id,
        "user_uid": user_uid,
        "alert_id": alert_payload.alert_id,
        "area_name": alert_payload.area_name,
        "risk_score": alert_payload.risk_score,
        "status": "DISPATCHED",
        "live_tracking_token": alert_payload.live_tracking_token,
        "created_at": datetime.utcnow().isoformat()
    })

    return alert_payload


@router.get("/logs", response_model=List[Dict[str, Any]])
async def list_emergency_logs(
    user_uid: str = Depends(get_current_user_uid),
    emergency_repo: EmergencyRepository = Depends(get_emergency_repository)
):
    """Lists past emergency dispatch log history from Firestore."""
    return await emergency_repo.list_emergency_logs(user_uid=user_uid)
