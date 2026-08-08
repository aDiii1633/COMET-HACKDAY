from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class GuardianCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    relation: str = Field(..., min_length=2, max_length=50)
    phone_number: str = Field(..., min_length=10, max_length=15)
    fcm_token: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


class GuardianResponse(BaseModel):
    guardian_id: str
    name: str
    relation: str
    phone_number: str
    fcm_token: Optional[str] = None
    status: str = "ACTIVE_GUARD"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GuardianAlertPayload(BaseModel):
    alert_id: str
    user_uid: str
    user_name: str
    current_location: dict
    area_name: str
    risk_score: float
    risk_level: str
    xai_reason: str
    historical_summary: str
    live_tracking_token: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
