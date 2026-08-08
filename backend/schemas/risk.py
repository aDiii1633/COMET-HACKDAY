from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RiskEvaluateRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    time_offset_minutes: int = Field(default=0, ge=0, le=60)


class RiskFactorsBreakdown(BaseModel):
    community_score: float
    illumination_score: float
    crowd_sparsity_score: float
    historical_score: float


class RiskEvaluationResponse(BaseModel):
    h3_index: str
    risk_score: float
    risk_level: str
    confidence: float = 0.95
    severity: str
    factors: RiskFactorsBreakdown
    xai_reasons: List[str]
    recommendations: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FutureRiskForecastResponse(BaseModel):
    h3_index: str
    current_risk_score: float
    forecasts: List[Dict[str, Any]]
