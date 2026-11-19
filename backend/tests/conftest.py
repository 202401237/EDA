import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.premium_service import PremiumService


@pytest.fixture(scope="session", autouse=True)
def initialize_app_model():
    """Ensure ML model is loaded before tests run."""
    PremiumService.load_model()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_premium_payload():
    return {
        "age": 38,
        "gender": "Male",
        "annualIncome": 35000.0,
        "maritalStatus": "Married",
        "numberOfDependents": 2,
        "educationLevel": "Bachelor's",
        "occupation": "Employed",
        "healthScore": 28.0,
        "location": "Urban",
        "policyType": "Comprehensive",
        "previousClaims": 1,
        "vehicleAge": 6,
        "creditScore": 680,
        "insuranceDuration": 4,
        "smokingStatus": "No",
        "exerciseFrequency": "Weekly",
        "propertyType": "House",
    }


@pytest.fixture
def valid_under_insurance_payload():
    return {
        "numberOfDependents": 3,
        "annualIncome": 45000.0,
        "vehicleAge": 1,
        "policyType": "Basic",
    }


@pytest.fixture
def valid_underwriting_margin_payload():
    return {
        "customerPaidPremium": 1250.0,
        "riskAdjustedMinPremium": 1000.0,
        "policyType": "Comprehensive",
        "previousClaims": 1,
        "vehicleAge": 5,
    }


@pytest.fixture
def valid_claim_burst_risk_payload():
    return {
        "vehicleAge": 12,
        "previousClaims": 3,
        "location": "Urban",
        "policyType": "Comprehensive",
        "age": 45,
        "smokingStatus": "Yes",
    }


@pytest.fixture
def valid_customer_churn_payload():
    return {
        "customerFeedback": "Poor",
        "currentPremium": 1450.0,
        "previousPremium": 1100.0,
        "insuranceDuration": 3,
        "policyType": "Comprehensive",
        "location": "Urban",
    }


@pytest.fixture
def valid_fraud_suspicion_payload():
    return {
        "claimReference": "CLM-2026-9081",
        "previousClaimsCount": None,
        "annualIncome": 50.0,
        "creditScore": 410,
        "policyType": "Basic",
        "vehicleAge": 8,
    }
