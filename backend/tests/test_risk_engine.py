import asyncio
from backend.services.risk_engine_service import RiskEngineService


def test_risk_engine_calculation():
    service = RiskEngineService()
    res = asyncio.run(service.calculate_risk(37.774929, -122.419416, time_offset_minutes=0))
    assert res.risk_score >= 0.0
    assert res.risk_score <= 100.0
    assert res.h3_index is not None
    assert res.risk_level in ["SAFE", "WARNING", "DANGER", "CRITICAL"]
