from fastapi import APIRouter
from app.schemas.underwriting import (
    UnderInsuranceInput,
    UnderInsuranceResult,
    UnderwritingMarginInput,
    UnderwritingMarginResult,
)
from app.schemas.claim_risk import ClaimBurstRiskInput, ClaimBurstRiskResult
from app.schemas.churn import CustomerChurnInput, CustomerChurnResult
from app.schemas.fraud import FraudSuspicionInput, FraudSuspicionResult
from app.services.underwriting_service import UnderwritingService
from app.services.claim_risk_service import ClaimRiskService
from app.services.churn_service import CustomerChurnService
from app.services.fraud_service import FraudService

router = APIRouter(tags=["Actuarial & Risk Analyses"])


# --- Under Insurance Warning ---
# Registered under /predict/under-insurance to match frontend callApi, with alias under /analyze
@router.post(
    "/predict/under-insurance",
    response_model=UnderInsuranceResult,
    summary="Under-Insurance Coverage Audit (Rule-Based)",
)
@router.post(
    "/analyze/under-insurance",
    response_model=UnderInsuranceResult,
    include_in_schema=False,
)
def evaluate_under_insurance(data: UnderInsuranceInput) -> UnderInsuranceResult:
    return UnderwritingService.evaluate_under_insurance(data)


# --- Underwriting Profit Margin ---
@router.post(
    "/analyze/underwriting-margin",
    response_model=UnderwritingMarginResult,
    summary="Underwriting Profit Margin Analysis (Deterministic Arithmetic)",
)
def analyze_underwriting_margin(data: UnderwritingMarginInput) -> UnderwritingMarginResult:
    return UnderwritingService.calculate_margin(data)


# --- Claim Burst & Location Risk ---
@router.post(
    "/analyze/claim-burst-risk",
    response_model=ClaimBurstRiskResult,
    summary="Claim Burst & Location-Based Risk (Rule-Based)",
)
def analyze_claim_burst_risk(data: ClaimBurstRiskInput) -> ClaimBurstRiskResult:
    return ClaimRiskService.analyze_claim_burst_risk(data)


# --- Customer Churn Alert ---
@router.post(
    "/analyze/customer-churn",
    response_model=CustomerChurnResult,
    summary="Customer Churn & Retention Alert (Rule-Based)",
)
def analyze_customer_churn(data: CustomerChurnInput) -> CustomerChurnResult:
    return CustomerChurnService.evaluate_churn_risk(data)


# --- Fraud Suspicion Audit ---
@router.post(
    "/analyze/fraud-suspicion",
    response_model=FraudSuspicionResult,
    summary="Fraud Suspicion Audit Flag (Rule-Based)",
)
def analyze_fraud_suspicion(data: FraudSuspicionInput) -> FraudSuspicionResult:
    return FraudService.audit_fraud_suspicion(data)
