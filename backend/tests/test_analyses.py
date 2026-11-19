import pytest


# --- 1. Under-Insurance Warning Tests ---
def test_under_insurance_high_risk(client, valid_under_insurance_payload):
    # Payload has: 3 dependents, $45,000 income, 1 yr vehicle, Basic plan -> High underinsured
    response = client.post("/api/v1/predict/under-insurance", json=valid_under_insurance_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["isUnderInsured"] is True
    assert data["riskLevel"] == "High"
    assert len(data["triggeredConditions"]) == 4
    assert data["isDemoResult"] is True


def test_under_insurance_low_risk(client):
    # 0 dependents, low income, old vehicle, Comprehensive plan -> Low risk
    payload = {
        "numberOfDependents": 0,
        "annualIncome": 12000.0,
        "vehicleAge": 8,
        "policyType": "Comprehensive",
    }
    response = client.post("/api/v1/predict/under-insurance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["isUnderInsured"] is False
    assert data["riskLevel"] == "Low"
    assert data["isDemoResult"] is True


def test_under_insurance_medium_risk(client):
    # Partial conditions: 2 dependents, new vehicle, but Comprehensive plan -> Medium risk
    payload = {
        "numberOfDependents": 2,
        "annualIncome": 15000.0,
        "vehicleAge": 1,
        "policyType": "Comprehensive",
    }
    response = client.post("/api/v1/predict/under-insurance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["isUnderInsured"] is False
    assert data["riskLevel"] == "Medium"


# --- 2. Underwriting Profit Margin Tests ---
def test_underwriting_margin_above(client, valid_underwriting_margin_payload):
    # 1250 paid vs 1000 min -> diff +250 -> 'Above'
    response = client.post("/api/v1/analyze/underwriting-margin", json=valid_underwriting_margin_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["difference"] == 250.0
    assert data["status"] == "Above"
    assert data["marginPercent"] == 25.0
    assert data["isDemoResult"] is True


def test_underwriting_margin_below(client):
    payload = {
        "customerPaidPremium": 800.0,
        "riskAdjustedMinPremium": 1000.0,
        "policyType": "Basic",
        "previousClaims": 2,
        "vehicleAge": 7,
    }
    response = client.post("/api/v1/analyze/underwriting-margin", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["difference"] == -200.0
    assert data["status"] == "Below"
    assert data["marginPercent"] == -20.0


def test_underwriting_margin_at(client):
    # Within +/- 10 margin
    payload = {
        "customerPaidPremium": 1005.0,
        "riskAdjustedMinPremium": 1000.0,
        "policyType": "Basic",
        "previousClaims": 0,
        "vehicleAge": 3,
    }
    response = client.post("/api/v1/analyze/underwriting-margin", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "At"


def test_underwriting_margin_zero_min(client):
    payload = {
        "customerPaidPremium": 500.0,
        "riskAdjustedMinPremium": 0.0,
        "policyType": "Basic",
        "previousClaims": 0,
        "vehicleAge": 1,
    }
    response = client.post("/api/v1/analyze/underwriting-margin", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["marginPercent"] == 0.0


# --- 3. Claim Burst Risk Tests ---
def test_claim_burst_risk_high(client, valid_claim_burst_risk_payload):
    # Vehicle age 12 (Medium), Claims 3 (High), Urban (High) -> score >= 4 -> High
    response = client.post("/api/v1/analyze/claim-burst-risk", json=valid_claim_burst_risk_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overallRisk"] == "High"
    assert data["locationRisk"] == "High"
    assert data["claimsRisk"] == "High"
    assert data["vehicleAgeRisk"] == "Medium"
    assert data["riskScore"] >= 60
    assert data["isDemoResult"] is True


def test_claim_burst_risk_low(client):
    payload = {
        "vehicleAge": 2,
        "previousClaims": 0,
        "location": "Rural",
        "policyType": "Basic",
        "age": 30,
        "smokingStatus": "No",
    }
    response = client.post("/api/v1/analyze/claim-burst-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overallRisk"] == "Low"
    assert data["locationRisk"] == "Low"
    assert data["claimsRisk"] == "Low"
    assert data["vehicleAgeRisk"] == "Low"
    assert data["riskScore"] == 0


# --- 4. Customer Churn Alert Tests ---
def test_customer_churn_poor_feedback(client, valid_customer_churn_payload):
    # Poor feedback -> Disjunctive OR makes it High risk
    response = client.post("/api/v1/analyze/customer-churn", json=valid_customer_churn_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["churnRisk"] == "High"
    assert data["churnProbability"] is None  # honest uncalibrated representation
    assert len(data["retentionSuggestions"]) > 0
    assert data["isDemoResult"] is True


def test_customer_churn_rate_shock(client):
    # Good feedback, but rate increase is from 1000 to 1400 (+40% > 15% shock threshold) -> High risk
    payload = {
        "customerFeedback": "Good",
        "currentPremium": 1400.0,
        "previousPremium": 1000.0,
        "insuranceDuration": 2,
        "policyType": "Basic",
        "location": "Suburban",
    }
    response = client.post("/api/v1/analyze/customer-churn", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["churnRisk"] == "High"


def test_customer_churn_low_risk(client):
    # Good feedback, no premium hike -> Low risk
    payload = {
        "customerFeedback": "Good",
        "currentPremium": 1000.0,
        "previousPremium": 1000.0,
        "insuranceDuration": 3,
        "policyType": "Basic",
        "location": "Rural",
    }
    response = client.post("/api/v1/analyze/customer-churn", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["churnRisk"] == "Low"


# --- 5. Fraud Suspicion Audit Tests ---
def test_fraud_suspicion_high(client, valid_fraud_suspicion_payload):
    # Missing claims (1), income 50 <= 100 (2), credit 410 < 450 (3) -> count 3 -> Potentially Suspicious
    response = client.post("/api/v1/analyze/fraud-suspicion", json=valid_fraud_suspicion_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Potentially Suspicious"
    assert data["indicatorCount"] == 3
    assert len(data["triggeredIndicators"]) == 3
    assert data["isDemoResult"] is True


def test_fraud_suspicion_further_verification(client):
    # Only 1 indicator: missing claims
    payload = {
        "claimReference": "CLM-2026-1022",
        "previousClaimsCount": None,
        "annualIncome": 45000.0,
        "creditScore": 720,
        "policyType": "Comprehensive",
        "vehicleAge": 4,
    }
    response = client.post("/api/v1/analyze/fraud-suspicion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Further Verification"
    assert data["indicatorCount"] == 1


def test_fraud_suspicion_low(client):
    # 0 indicators
    payload = {
        "claimReference": "CLM-2026-0001",
        "previousClaimsCount": 0,
        "annualIncome": 50000.0,
        "creditScore": 750,
        "policyType": "Premium",
        "vehicleAge": 3,
    }
    response = client.post("/api/v1/analyze/fraud-suspicion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Low Suspicion"
    assert data["indicatorCount"] == 0
