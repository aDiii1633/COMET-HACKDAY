from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class IncidentCategory(str, Enum):
    POOR_LIGHTING = "POOR_LIGHTING"
    HARASSMENT_HOTSPOT = "HARASSMENT_HOTSPOT"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    PHYSICAL_HAZARD = "PHYSICAL_HAZARD"
    STALKING = "STALKING"
    THEFT = "THEFT"
    OTHERS = "OTHERS"


class ReportCreateRequest(BaseModel):
    category: IncidentCategory
    severity: int = Field(..., ge=1, le=5)
    description: str = Field(..., min_length=5, max_length=500)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    image_b64: Optional[str] = None


class CommunityReportResponse(BaseModel):
    report_id: str
    category: IncidentCategory
    severity: int
    description: str
    latitude: float
    longitude: float
    h3_index: str
    verification_count: int = 1
    status: str = "VERIFIED"
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
