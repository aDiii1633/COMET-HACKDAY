import httpx
from typing import List, Dict, Any
from backend.schemas.route import SafeRouteRequest, SafeRouteResponse, RouteOption, LocationPoint
from backend.services.risk_engine_service import RiskEngineService
from backend.services.openai_service import OpenAIService
from backend.core.config import settings
from backend.core.logging import logger
import math


def decode_polyline(polyline_str: str) -> List[List[float]]:
    """Decodes Google Maps polyline string into a list of [lng, lat] coordinates."""
    index, lat, lng = 0, 0, 0
    coordinates = []
    changes = {'latitude': 0, 'longitude': 0}

    while index < len(polyline_str):
        for unit in ['latitude', 'longitude']:
            shift, result = 0, 0
            while True:
                byte = ord(polyline_str[index]) - 63
                index += 1
                result |= (byte & 0x1f) << shift
                shift += 5
                if not byte >= 0x20:
                    break
            if (result & 1):
                changes[unit] = ~(result >> 1)
            else:
                changes[unit] = (result >> 1)

        lat += changes['latitude']
        lng += changes['longitude']
        coordinates.append([lng / 100000.0, lat / 100000.0])

    return coordinates


class SafeRouteService:
    """SafeRoute Navigation Engine calculating Safest vs Fast-Balanced multi-paths."""

    def __init__(self, risk_engine: RiskEngineService = None):
        self.risk_engine = risk_engine or RiskEngineService()
        self.openai_service = OpenAIService()

    async def calculate_safe_routes(self, request: SafeRouteRequest) -> SafeRouteResponse:
        origin = request.origin
        destination = request.destination
        offset = request.time_offset_minutes
        api_key = settings.GOOGLE_MAPS_API_KEY

        # Fail if no API key
        if not api_key:
            raise ValueError("Google Maps API Key is missing. Live route calculation unavailable.")

        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{origin.latitude},{origin.longitude}",
            "destination": f"{destination.latitude},{destination.longitude}",
            "alternatives": "true",
            "key": api_key,
            "mode": "walking"
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, params=params, timeout=10.0)
                data = resp.json()

            if data.get("status") != "OK":
                logger.warn("google_maps_directions_failed", status=data.get("status"))
                raise RuntimeError(f"Google Maps API failed with status: {data.get('status')}")

            routes = data.get("routes", [])
            route_options = []

            for idx, route in enumerate(routes):
                leg = route["legs"][0]
                distance_meters = leg["distance"]["value"]
                duration_seconds = leg["duration"]["value"]
                polyline = route["overview_polyline"]["points"]
                coords = decode_polyline(polyline)
                
                # Sample points along the route to calculate composite risk
                sample_points = coords[::max(1, len(coords)//10)] # Sample up to 10 points
                total_risk = 0
                for pt in sample_points:
                    r = await self.risk_engine.calculate_risk(pt[1], pt[0], offset)
                    total_risk += r.risk_score
                avg_risk = total_risk / max(len(sample_points), 1)

                route_options.append(RouteOption(
                    id=f"route_{idx}",
                    name=f"Route {idx + 1} ({leg['distance']['text']})",
                    risk_score=round(avg_risk, 1),
                    risk_level="DANGER" if avg_risk > settings.RISK_THRESHOLD_DANGER else "WARNING" if avg_risk > settings.RISK_THRESHOLD_WARNING else "SAFE",
                    distance_meters=float(distance_meters),
                    duration_seconds=float(duration_seconds),
                    illumination_score=100.0 - (avg_risk * 0.4), # Simulated for now
                    crowd_density_score=100.0 - (avg_risk * 0.5), # Simulated for now
                    geometry={"type": "LineString", "coordinates": coords},
                    xai_summary="" # Will fill below
                ))

            # Sort routes by risk score (ascending)
            route_options.sort(key=lambda x: x.risk_score)
            safest = route_options[0]
            safest.name = "Safest Route"
            
            # Sort remaining by duration (ascending) to find fastest alternative
            alternatives = []
            if len(route_options) > 1:
                fastest = min(route_options[1:], key=lambda x: x.duration_seconds)
                if fastest.id != safest.id:
                    fastest.name = "Fastest Route"
                    alternatives.append(fastest)

            # Generate XAI for the routes
            safest_context = {"risk_score": safest.risk_score, "risk_level": safest.risk_level, "community_reports_count": 0, "historical_score": safest.risk_score * 0.5, "safe_places": []}
            if not self.risk_engine.crime_service.is_historical_data_available:
                safest.xai_summary = "Insufficient verified data — historical crime dataset unavailable."
            else:
                safest.xai_summary = await self.openai_service.chat_assistant("Explain why this route is safe in one short sentence.", safest_context)
            
            if alternatives:
                fastest_context = {"risk_score": alternatives[0].risk_score, "risk_level": alternatives[0].risk_level, "community_reports_count": 2, "historical_score": alternatives[0].risk_score * 0.5, "safe_places": []}
                if not self.risk_engine.crime_service.is_historical_data_available:
                    alternatives[0].xai_summary = "Insufficient verified data — historical crime dataset unavailable."
                else:
                    alternatives[0].xai_summary = await self.openai_service.chat_assistant("Explain why this route has higher risk in one short sentence.", fastest_context)

            delta = 0
            if alternatives:
                delta = safest.risk_score - alternatives[0].risk_score

            return SafeRouteResponse(
                safest_route=safest,
                alternative_routes=alternatives,
                risk_comparison={
                    "risk_score_delta": round(delta, 1),
                    "distance_penalty_percent": round(((safest.distance_meters / max(alternatives[0].distance_meters, 1)) - 1) * 100, 1) if alternatives else 0,
                    "recommendation": "Safest Route recommended for evening transit."
                }
            )

        except Exception as e:
            logger.error("saferoute_api_error", error=str(e))
            raise e

    # Fake data fallback removed entirely.
