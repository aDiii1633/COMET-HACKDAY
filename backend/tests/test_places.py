import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_emergency_nearby_places_endpoint():
    payload = {
        "latitude": 37.774929,
        "longitude": -122.419416,
        "radius_meters": 2000
    }
    response = client.post("/api/v1/places/emergency-nearby", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "nearest_police" in data
    assert "nearest_hospitals" in data
    assert len(data["nearest_police"]) > 0
