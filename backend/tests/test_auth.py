import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_auth_me_endpoint():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "name" in data
