from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class LocationPoint(BaseModel):
    name: Optional[str] = "Location Point"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class SafeRouteRequest(BaseModel):
    origin: LocationPoint
    destination: LocationPoint
    time_offset_minutes: int = Field(default=0, ge=0, le=60)


class RouteOption(BaseModel):
    id: str
    name: str
    risk_score: float
    risk_level: str
    distance_meters: float
    duration_seconds: float
    illumination_score: float
    crowd_density_score: float
    geometry: Dict[str, Any]
    xai_summary: str


class SafeRouteResponse(BaseModel):
    safest_route: RouteOption
    alternative_routes: List[RouteOption]
    risk_comparison: Dict[str, Any]
