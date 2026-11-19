import pytest
from app.services.premium_service import PremiumService


def test_predict_premium_valid(client, valid_premium_payload):
    response = client.post("/api/v1/predict/premium", json=valid_premium_payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimatedPremium" in data
    assert isinstance(data["estimatedPremium"], (int, float))
    assert data["estimatedPremium"] >= 20.0
    assert data["policyType"] == valid_premium_payload["policyType"]
    assert data["premiumCategory"] in ["Low", "Medium", "High"]
    assert data["isDemoResult"] is False  # Genuine ML prediction!
    assert data["confidenceLow"] is None
    assert data["confidenceHigh"] is None
    assert data["submittedInputs"]["age"] == valid_premium_payload["age"]


def test_predict_premium_boundary_values(client, valid_premium_payload):
    # Minimum valid boundary values
    payload = valid_premium_payload.copy()
    payload["age"] = 18
    payload["annualIncome"] = 0.0
    payload["numberOfDependents"] = 0
    payload["creditScore"] = 300
    payload["vehicleAge"] = 0
    payload["previousClaims"] = 0
    payload["insuranceDuration"] = 1

    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 200
    assert response.json()["estimatedPremium"] > 0

    # Maximum valid boundary values
    payload["age"] = 64
    payload["creditScore"] = 850
    payload["vehicleAge"] = 25
    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 200


def test_predict_premium_invalid_age(client, valid_premium_payload):
    payload = valid_premium_payload.copy()
    payload["age"] = 16  # below minimum age 18
    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 422
    assert "Input validation error" in response.json()["detail"]


def test_predict_premium_negative_income(client, valid_premium_payload):
    payload = valid_premium_payload.copy()
    payload["annualIncome"] = -1000.0
    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 422


def test_predict_premium_invalid_enum(client, valid_premium_payload):
    payload = valid_premium_payload.copy()
    payload["gender"] = "NonBinary"  # Not in supported dataset categories
    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 422


def test_predict_premium_missing_field(client, valid_premium_payload):
    payload = valid_premium_payload.copy()
    del payload["policyType"]
    response = client.post("/api/v1/predict/premium", json=payload)
    assert response.status_code == 422


def test_model_unavailable_error(client, valid_premium_payload, monkeypatch):
    # Temporarily simulate unloaded model
    original_model = PremiumService._model
    try:
        PremiumService._model = None
        monkeypatch.setattr(PremiumService, "load_model", lambda: None)
        response = client.post("/api/v1/predict/premium", json=valid_premium_payload)
        assert response.status_code == 503
        assert "not available" in response.json()["detail"]
    finally:
        PremiumService._model = original_model
