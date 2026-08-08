from fastapi import APIRouter, Depends
from backend.schemas.maps import GeocodeRequest, ReverseGeocodeRequest, GeocodeResponse, DistanceMatrixRequest, DistanceMatrixResponse
from backend.services.maps_service import MapsService

router = APIRouter(prefix="/maps", tags=["Google Maps Services"])


def get_maps_service() -> MapsService:
    return MapsService()


@router.post("/geocode", response_model=GeocodeResponse)
async def geocode_address(
    request: GeocodeRequest,
    maps_service: MapsService = Depends(get_maps_service)
):
    """Converts address string to latitude/longitude coordinates."""
    return await maps_service.geocode(request)


@router.post("/reverse-geocode", response_model=GeocodeResponse)
async def reverse_geocode_coordinates(
    request: ReverseGeocodeRequest,
    maps_service: MapsService = Depends(get_maps_service)
):
    """Converts latitude/longitude coordinates to human-readable address."""
    return await maps_service.reverse_geocode(request)


@router.post("/distance-matrix", response_model=DistanceMatrixResponse)
async def calculate_distance_matrix(
    request: DistanceMatrixRequest,
    maps_service: MapsService = Depends(get_maps_service)
):
    """Calculates distance & traffic-aware duration matrix between origin/destination points."""
    return await maps_service.calculate_distance_matrix(request)
