from fastapi import APIRouter, Depends
from backend.schemas.route import SafeRouteRequest, SafeRouteResponse
from backend.services.saferoute_service import SafeRouteService
from backend.core.dependencies import get_saferoute_service

router = APIRouter(prefix="/routes", tags=["AI SafeRoute Engine"])


@router.post("/calculate", response_model=SafeRouteResponse)
async def calculate_safe_routes(
    request: SafeRouteRequest,
    saferoute_service: SafeRouteService = Depends(get_saferoute_service)
):
    """Calculates Safest vs Fast-Balanced multi-path navigation routes."""
    return await saferoute_service.calculate_safe_routes(request)


from pydantic import BaseModel
class JourneyRequest(BaseModel):
    destination_name: str
    eta_minutes: int
    safest_route_id: str

@router.post("/start-journey")
async def start_journey(request: JourneyRequest):
    """Broadcasts Journey Started to Guardian Circle via FCM (simulated)."""
    return {"status": "JOURNEY_STARTED", "message": f"Guardian Circle notified for journey to {request.destination_name}."}


@router.post("/end-journey")
async def end_journey():
    """Broadcasts Journey Ended to Guardian Circle via FCM (simulated)."""
    return {"status": "JOURNEY_ENDED", "message": "Guardian Circle notified."}
