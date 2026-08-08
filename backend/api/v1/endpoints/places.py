from fastapi import APIRouter, Depends
from backend.schemas.places import NearbyPlacesRequest, EmergencyPlacesResponse
from backend.services.places_service import PlacesService

router = APIRouter(prefix="/places", tags=["Google Places & Safe Havens"])


def get_places_service() -> PlacesService:
    return PlacesService()


@router.post("/emergency-nearby", response_model=EmergencyPlacesResponse)
async def get_emergency_nearby_places(
    request: NearbyPlacesRequest,
    places_service: PlacesService = Depends(get_places_service)
):
    """Fetches nearest Police Station, Hospital, Pharmacy, Metro Station, and Safe Public Places."""
    return await places_service.get_emergency_nearby_places(request)
