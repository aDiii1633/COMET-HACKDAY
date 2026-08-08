from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class PlaceTypeEnum(str, Enum):
    POLICE = "police"
    HOSPITAL = "hospital"
    PHARMACY = "pharmacy"
    TRANSIT_STATION = "transit_station"
    SAFE_PUBLIC_PLACE = "safe_public_place"


class NearbyPlacesRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    radius_meters: int = Field(default=2000, ge=100, le=10000)
    place_type: Optional[PlaceTypeEnum] = None


class EmergencyPlaceItem(BaseModel):
    place_id: str
    name: str
    place_type: PlaceTypeEnum
    latitude: float
    longitude: float
    distance_meters: float
    rating: float = 4.5
    user_ratings_total: int = 120
    is_open_now: bool = True
    address: str
    phone_number: Optional[str] = None


class EmergencyPlacesResponse(BaseModel):
    nearest_police: List[EmergencyPlaceItem]
    nearest_hospitals: List[EmergencyPlaceItem]
    nearest_pharmacies: List[EmergencyPlaceItem]
    nearest_transit: List[EmergencyPlaceItem]
    nearest_safe_places: List[EmergencyPlaceItem]
