"""
SafeSphere AI — Crime Intelligence Layer
Integrates Kaggle historical CSV data + data.gov.in Government Crime API
into a unified Crime Intelligence Layer powering the Risk Engine H(s,t).
"""
import csv
import math
import httpx
from typing import List, Dict, Any, Optional
from backend.core.config import settings
from backend.core.logging import logger


import os
import json

def load_kaggle_dataset() -> List[Dict[str, Any]]:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, "data", "kaggle_crime_dataset.csv")
    if not os.path.exists(dataset_path):
        logger.warn("kaggle_dataset_not_found", path=dataset_path)
        return []
        
    records = []
    try:
        with open(dataset_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    records.append({
                        "city": row.get("city", "Unknown"),
                        "state": row.get("state", "Unknown"),
                        "crime_type": row.get("crime_type", "UNKNOWN"),
                        "lat": float(row.get("lat", 0.0)),
                        "lng": float(row.get("lng", 0.0)),
                        "severity": int(row.get("severity", 1)),
                        "category": row.get("category", "UNKNOWN"),
                        "time_bias": row.get("time_bias", "night")
                    })
                except (ValueError, TypeError):
                    continue
        logger.info("kaggle_dataset_loaded", count=len(records))
    except Exception as e:
        logger.error("kaggle_dataset_parse_error", error=str(e))
        
    return records

CRIME_INTELLIGENCE_DB: List[Dict[str, Any]] = load_kaggle_dataset()

def load_delhi_police_caw() -> Dict[str, Any]:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, "data", "delhi_police_caw_historical.json")
    if not os.path.exists(dataset_path):
        return {}
    try:
        with open(dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("caw_dataset_parse_error", error=str(e))
        return {}

CAW_DATA = load_delhi_police_caw()


class CrimeDataService:
    """Unified Crime Intelligence Layer — merges Kaggle CSV + data.gov.in + Community Reports."""
    
    _gov_cache: List[Dict[str, Any]] = []

    def __init__(self):
        self._crime_db = CRIME_INTELLIGENCE_DB
        self.is_historical_data_available = len(self._crime_db) > 0
        self.caw_data = CAW_DATA

    def get_women_safety_stats(self) -> Dict[str, Any]:
        """Returns the official Delhi Police Crime Against Women (CAW) dataset."""
        return self.caw_data

    async def fetch_government_crime_data(self, state: str = "Delhi") -> List[Dict[str, Any]]:
        """Fetches crime statistics from data.gov.in open API."""
        api_key = settings.DATA_GOV_IN_API_KEY
        if not api_key:
            logger.warn("data_gov_in_api_key_not_configured")
            return []

        try:
            url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={api_key}&format=json&limit=50"
            if state:
                url += f"&filters[state_ut]={state}"
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    records = data.get("records", [])
                    CrimeDataService._gov_cache = records
                    logger.info("data_gov_in_fetched", count=len(records), state=state)
                    return records
        except Exception as e:
            logger.warn("data_gov_in_fallback", error=str(e))

        return []

    def calculate_historical_crime_score(self, latitude: float, longitude: float, radius_km: float = 5.0) -> float:
        """
        Calculates H(s,t) — Historical Crime Severity Index for a coordinate.
        Uses spatial proximity weighting with inverse-distance decay.
        Score: 0 (no crime) to 100 (extreme crime density).
        """
        total_weighted_severity = 0.0
        match_count = 0

        for record in self._crime_db:
            dist = self._haversine(latitude, longitude, record["lat"], record["lng"])
            if dist <= radius_km:
                # Inverse distance decay: closer crimes weigh more
                decay = max(0.1, 1.0 - (dist / radius_km))
                total_weighted_severity += record["severity"] * decay * 12.0
                match_count += 1

        # Also incorporate government data if cached
        for gov_rec in CrimeDataService._gov_cache:
            try:
                total = int(gov_rec.get("total_crimes_against_women", 0))
                if total > 0:
                    total_weighted_severity += min(total / 100.0, 30.0)
                    match_count += 1
            except (ValueError, TypeError):
                pass

        if match_count == 0:
            return 10.0  # Baseline for unknown areas

        score = min(100.0, total_weighted_severity / max(match_count, 1))
        return round(score, 1)

    def search_crimes_near(self, latitude: float, longitude: float, radius_km: float = 3.0) -> List[Dict[str, Any]]:
        """Returns crime records within a radius of the given coordinate."""
        results = []
        for record in self._crime_db:
            dist = self._haversine(latitude, longitude, record["lat"], record["lng"])
            if dist <= radius_km:
                results.append({**record, "distance_km": round(dist, 2)})
        results.sort(key=lambda x: x["distance_km"])
        return results

    def get_crime_stats_summary(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Returns summary crime stats for dashboard and AI context."""
        nearby = self.search_crimes_near(latitude, longitude, radius_km=5.0)
        categories: Dict[str, int] = {}
        total_severity = 0
        for c in nearby:
            cat = c.get("category", "OTHERS")
            categories[cat] = categories.get(cat, 0) + 1
            total_severity += c.get("severity", 1)

        return {
            "total_nearby_crimes": len(nearby),
            "avg_severity": round(total_severity / max(len(nearby), 1), 1),
            "category_breakdown": categories,
            "top_crime_type": max(categories, key=categories.get) if categories else "NONE",
            "historical_score": self.calculate_historical_crime_score(latitude, longitude),
            "is_historical_data_available": self.is_historical_data_available
        }

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
