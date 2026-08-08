from typing import List, Dict, Any
from fastapi import APIRouter
from backend.services.crime_data_service import CrimeDataService

router = APIRouter(prefix="/crime", tags=["Crime Intelligence"])

_service = CrimeDataService()


@router.get("/nearby", response_model=List[Dict[str, Any]])
async def get_nearby_crimes(latitude: float = 28.6139, longitude: float = 77.2090, radius_km: float = 5.0):
    """Returns historical crime records near a coordinate from the Crime Intelligence Layer."""
    return _service.search_crimes_near(latitude, longitude, radius_km)


@router.get("/stats", response_model=Dict[str, Any])
async def get_crime_stats(latitude: float = 28.6139, longitude: float = 77.2090):
    """Returns aggregated crime statistics summary for a location."""
    return _service.get_crime_stats_summary(latitude, longitude)


@router.get("/government", response_model=List[Dict[str, Any]])
async def fetch_government_data(state: str = "Delhi"):
    """Fetches live government crime data from data.gov.in API."""
    return await _service.fetch_government_crime_data(state)


@router.get("/women-safety-stats", response_model=Dict[str, Any])
async def get_women_safety_stats():
    """Returns official historical Delhi Police Crime Against Women data."""
    return _service.get_women_safety_stats()
