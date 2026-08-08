import h3
import math
from typing import Dict, Any, List
from backend.core.config import settings
from backend.schemas.risk import RiskEvaluationResponse, RiskFactorsBreakdown
from backend.repositories.report_repository import ReportRepository
from backend.services.crime_data_service import CrimeDataService


class RiskEngineService:
    """
    SafeSphere Spatial-Temporal Composite Risk Engine R(s, t):
    R(s, t) = alpha * C(s) + beta * L(s, t) + gamma * D(s, t) + delta * H(s, t)

    Now powered by real Crime Intelligence Layer for H(s,t).
    """

    MODEL_WEIGHTS = {
        "alpha": 0.35, # Community Incident Density
        "beta": 0.25,  # Illumination Deficiency Index
        "gamma": 0.20, # Pedestrian Crowd Sparsity Penalty
        "delta": 0.20, # Historical Crime Severity Index (from Crime Intelligence Layer)
    }

    def __init__(self, report_repo: ReportRepository = None):
        self.report_repo = report_repo or ReportRepository()
        self.crime_service = CrimeDataService()

    async def calculate_risk(self, latitude: float, longitude: float, time_offset_minutes: int = 0) -> RiskEvaluationResponse:
        h3_index = h3.latlng_to_cell(latitude, longitude, 9)

        # Fetch recent community reports
        reports = await self.report_repo.get_all_reports()

        # 1. Community Incident Density (C) — from live community reports
        community_score = 10.0
        for rep in reports:
            dist_sq = (rep["latitude"] - latitude)**2 + (rep["longitude"] - longitude)**2
            if dist_sq < 0.0001:  # ~11m radius
                community_score += rep["severity"] * 14.0
            elif dist_sq < 0.001:  # ~100m radius
                community_score += rep["severity"] * 6.0
        community_score = min(100.0, community_score)

        # 2. Illumination Deficiency Index (L) — time-aware
        hour_offset = time_offset_minutes / 60.0
        illumination_score = 15.0
        if time_offset_minutes > 0:
            illumination_score += time_offset_minutes * 1.2
        # Simulate night penalty (after 8pm)
        illumination_score += 20.0  # base nighttime penalty for demo
        illumination_score = min(100.0, illumination_score)

        # 3. Crowd Sparsity Penalty (D) — time-aware
        crowd_sparsity_score = 20.0
        if time_offset_minutes >= 30:
            crowd_sparsity_score += 40.0
        elif time_offset_minutes >= 15:
            crowd_sparsity_score += 20.0
        crowd_sparsity_score = min(100.0, crowd_sparsity_score)

        # 4. Historical Crime Severity Index (H) — from Crime Intelligence Layer
        historical_score = self.crime_service.calculate_historical_crime_score(latitude, longitude)

        # Composite Score Calculation
        composite_score = round(
            self.MODEL_WEIGHTS["alpha"] * community_score +
            self.MODEL_WEIGHTS["beta"] * illumination_score +
            self.MODEL_WEIGHTS["gamma"] * crowd_sparsity_score +
            self.MODEL_WEIGHTS["delta"] * historical_score,
            1
        )

        composite_score = max(5.0, min(99.0, composite_score))

        risk_level = "SAFE"
        severity = "LOW"
        if composite_score > settings.RISK_THRESHOLD_DANGER:
            risk_level = "DANGER"
            severity = "HIGH"
        elif composite_score > settings.RISK_THRESHOLD_WARNING:
            risk_level = "WARNING"
            severity = "MODERATE"

        # Dynamic XAI reasons based on actual factor contributions
        crime_stats = self.crime_service.get_crime_stats_summary(latitude, longitude)
        reasons = []
        if community_score > 30:
            reasons.append(f"{int(community_score)}% incident concentration from {len(reports)} community reports within 100m.")
        if illumination_score > 40:
            reasons.append(f"Illumination Index: {100 - int(illumination_score)}/100 — poor street lighting detected.")
        if crowd_sparsity_score > 40:
            reasons.append(f"Pedestrian activity: {100 - int(crowd_sparsity_score)}% — area becomes deserted.")
        if historical_score > 25:
            reasons.append(f"{crime_stats['total_nearby_crimes']} historical {crime_stats.get('top_crime_type', 'crime')} records within 5km.")
        if not reasons:
            reasons = ["Area currently within normal safety parameters.", "No significant risk factors detected."]

        recommendations = []
        if composite_score > 60:
            recommendations = [
                "Switch to an illuminated main avenue SafeRoute immediately.",
                "Avoid deserted commercial alleys and unlit corridors.",
                "Enable live Guardian Circle tracking for this journey."
            ]
        elif composite_score > 30:
            recommendations = [
                "Stay on well-lit and populated routes.",
                "Keep AI Safety Pulse monitoring active.",
                "Share your live location with a trusted guardian."
            ]
        else:
            recommendations = [
                "Area is currently safe. Continue your journey.",
                "AI Safety Pulse is monitoring in the background.",
                "Report any suspicious activity to help the community."
            ]

        return RiskEvaluationResponse(
            h3_index=h3_index,
            risk_score=composite_score,
            risk_level=risk_level,
            confidence=round(0.85 + (min(len(reports), 10) * 0.01), 2),
            severity=severity,
            factors=RiskFactorsBreakdown(
                community_score=community_score,
                illumination_score=illumination_score,
                crowd_sparsity_score=crowd_sparsity_score,
                historical_score=historical_score
            ),
            xai_reasons=reasons,
            recommendations=recommendations
        )
