from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GeocodeRequest(BaseModel):
    address: str = Field(..., min_length=2)


class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class GeocodeResponse(BaseModel):
    address: str
    latitude: float
    longitude: float
    place_id: Optional[str] = None


class DistanceMatrixRequest(BaseModel):
    origins: List[Dict[str, float]]
    destinations: List[Dict[str, float]]
    mode: str = "walking" # "walking" | "driving" | "transit"


class DistanceMatrixResponse(BaseModel):
    distance_meters: float
    duration_seconds: float
    traffic_duration_seconds: Optional[float] = None
    status: str = "OK"
