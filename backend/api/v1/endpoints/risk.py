from fastapi import APIRouter, Depends
from backend.schemas.risk import RiskEvaluateRequest, RiskEvaluationResponse, FutureRiskForecastResponse
from backend.services.risk_engine_service import RiskEngineService
from backend.core.dependencies import get_risk_engine_service

router = APIRouter(prefix="/risk", tags=["AI Risk Engine"])


@router.post("/evaluate", response_model=RiskEvaluationResponse)
async def evaluate_risk(
    request: RiskEvaluateRequest,
    risk_engine: RiskEngineService = Depends(get_risk_engine_service)
):
    """Calculates spatial-temporal composite risk score R(s, t)."""
    return await risk_engine.calculate_risk(request.latitude, request.longitude, request.time_offset_minutes)


@router.get("/forecast", response_model=FutureRiskForecastResponse)
async def forecast_future_risk(
    latitude: float = 37.774929,
    longitude: float = -122.419416,
    risk_engine: RiskEngineService = Depends(get_risk_engine_service)
):
    """Forecasts dynamic risk score shifts over the next 60 minutes."""
    current_res = await risk_engine.calculate_risk(latitude, longitude, 0)
    forecasts = []
    for offset in [15, 30, 45, 60]:
        res = await risk_engine.calculate_risk(latitude, longitude, offset)
        forecasts.append({"time_offset_minutes": offset, "forecast_risk_score": res.risk_score, "risk_level": res.risk_level})

    return FutureRiskForecastResponse(
        h3_index=current_res.h3_index,
        current_risk_score=current_res.risk_score,
        forecasts=forecasts
    )
